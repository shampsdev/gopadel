from faststream import FastStream
from faststream.nats import NatsBroker, KvWatch
from faststream.nats.annotations import NatsMessage
from typing import Any, Callable, Dict, List, Optional, TypeVar, Union, Awaitable
import asyncio
import json
from functools import wraps
import logging
from config import settings
import time

logger = logging.getLogger(__name__)

nats_url = f"nats://{settings.NATS_URL}:{settings.NATS_PORT}"
logger.info(f"Initializing NATS broker with URL: {nats_url}")

broker = NatsBroker(
    servers=nats_url,
    token=settings.NATS_TOKEN if settings.NATS_TOKEN else None
)
app = FastStream(broker)

T = TypeVar('T')

class NatsClient:
    def __init__(self, broker: NatsBroker):
        self.broker = broker
        self._subscribers = {}
        self._connected = False
        self._last_connection_attempt = 0
        self._connection_retry_delay = 30  # Не пытаться подключаться 30 секунд после неудачи
        
    async def connect(self):
        """Connect to NATS server"""
        current_time = time.time()
        
        # Проверяем, не слишком ли рано пытаться подключиться снова
        if (not self._connected and 
            current_time - self._last_connection_attempt < self._connection_retry_delay):
            logger.debug(f"Skipping connection attempt, last attempt was {current_time - self._last_connection_attempt:.1f}s ago")
            raise ConnectionError("Too soon to retry connection")
        
        if not self._connected:
            self._last_connection_attempt = current_time
            try:
                logger.info(f"Attempting to connect to NATS server at {nats_url}")
                # Добавляем таймаут для подключения
                await asyncio.wait_for(self.broker.connect(), timeout=3.0)
                self._connected = True
                self._last_connection_attempt = 0  # Сбрасываем таймер при успешном подключении
                logger.info("Successfully connected to NATS server")
            except asyncio.TimeoutError:
                logger.error(f"Connection to NATS server at {nats_url} timed out after 3 seconds")
                self._connected = False
                raise
            except Exception as e:
                logger.error(f"Failed to connect to NATS server at {nats_url}: {str(e)}")
                self._connected = False
                raise
    
    def is_available(self) -> bool:
        """Check if NATS is available for publishing without attempting connection"""
        current_time = time.time()
        
        if self._connected:
            return True
            
        # Если недавно была неудачная попытка подключения, считаем недоступным
        return current_time - self._last_connection_attempt >= self._connection_retry_delay
    
    async def disconnect(self):
        """Disconnect from NATS server"""
        if self._connected:
            try:
                await self.broker.close()
                self._connected = False
                logger.info("Disconnected from NATS server")
            except Exception as e:
                logger.error(f"Error disconnecting from NATS server: {str(e)}")
    
    async def publish(self, subject: str, message: Any, headers: Optional[Dict[str, str]] = None) -> bool:
        """
        Publish a message to a NATS subject
        
        Args:
            subject: The NATS subject to publish to
            message: The message to publish (will be JSON serialized if not a string)
            headers: Optional headers to include with the message
            
        Returns:
            bool: True if message was published successfully, False otherwise
        """
        try:
            # Ensure connection before publishing
            if not self._connected:
                await self.connect()
                
            if not isinstance(message, str):
                message = json.dumps(message)
                
            # Добавляем таймаут для публикации
            await asyncio.wait_for(
                self.broker.publish(
                    subject=subject,
                    message=message,
                    headers=headers
                ),
                timeout=3.0
            )
            logger.debug(f"Successfully published message to {subject}")
            return True
        except ConnectionError as e:
            # Если подключение недоступно из-за ограничения по времени
            logger.debug(f"Skipping publish to {subject}: {str(e)}")
            return False
        except asyncio.TimeoutError:
            logger.error(f"Publishing to {subject} timed out after 3 seconds")
            self._connected = False
            return False
        except Exception as e:
            logger.error(f"Failed to publish message to {subject}: {str(e)}")
            # Mark as disconnected if connection error
            if any(keyword in str(e).lower() for keyword in ["connection", "not connected", "eof", "timeout"]):
                self._connected = False
            return False

    
    async def request(self, subject: str, message: Any, timeout: float = 2.0) -> Any:
        """
        Send a request and wait for a response
        
        Args:
            subject: The NATS subject to send the request to
            message: The message to send (will be JSON serialized if not a string)
            timeout: Timeout in seconds for the request
            
        Returns:
            The response message (JSON decoded if possible)
        """
        try:
            # Ensure connection before sending request
            if not self._connected:
                await self.connect()
                
            if not isinstance(message, str):
                message = json.dumps(message)
                
            response = await self.broker.request(
                subject=subject,
                message=message,
                timeout=timeout
            )
            
            # Try to decode JSON response
            try:
                return json.loads(response.data)
            except (json.JSONDecodeError, TypeError):
                return response.data
                
        except asyncio.TimeoutError:
            logger.error(f"Request to {subject} timed out after {timeout} seconds")
            raise
        except Exception as e:
            logger.error(f"Error requesting from {subject}: {str(e)}")
            # Mark as disconnected if connection error
            if "connection" in str(e).lower() or "not connected" in str(e).lower():
                self._connected = False
            raise
    
    async def subscribe(self, subject: str, queue: Optional[str] = None, 
                       handler: Callable[[Any, NatsMessage], Awaitable[None]] = None):
        """
        Subscribe to a NATS subject
        
        Args:
            subject: The NATS subject to subscribe to
            queue: Optional queue group name for load balancing
            handler: Async callback function to handle received messages
        """
        if not handler:
            raise ValueError("Handler function must be provided")
            
        # Ensure connection before subscribing
        if not self._connected:
            await self.connect()
            
        @wraps(handler)
        async def wrapper(msg: NatsMessage):
            try:
                data = msg.data
                # Try to decode JSON if it's a string
                if isinstance(data, str):
                    try:
                        data = json.loads(data)
                    except json.JSONDecodeError:
                        pass
                
                await handler(data, msg)
            except Exception as e:
                logger.error(f"Error in subscription handler for {subject}: {str(e)}")
                
        subscription = await self.broker.subscribe(
            subject=subject,
            queue=queue,
            callback=wrapper
        )
        
        self._subscribers[subject] = subscription
        logger.info(f"Subscribed to {subject}" + (f" with queue {queue}" if queue else ""))
        return subscription
    
    async def unsubscribe(self, subject: str):
        """Unsubscribe from a NATS subject"""
        if subject in self._subscribers:
            await self._subscribers[subject].unsubscribe()
            del self._subscribers[subject]
            logger.info(f"Unsubscribed from {subject}")


nats_client = NatsClient(broker)

# Export the instance and app
__all__ = ["nats_client", "app"]
