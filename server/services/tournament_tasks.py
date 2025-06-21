from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID
import logging

from services.task_manager import nats_client
from config import settings

logger = logging.getLogger(__name__)

class TournamentTaskNames:
    REGISTRATION_SUCCESS = "tournament.registration.success"
    PAYMENT_REMINDER_1 = "tournament.payment.reminder.1"
    PAYMENT_REMINDER_2 = "tournament.payment.reminder.2"
    PAYMENT_REMINDER_3 = "tournament.payment.reminder.3"
    PAYMENT_SUCCESS = "tournament.payment.success"
    LOYALTY_LEVEL_CHANGED = "tournament.loyalty.changed"
    REGISTRATION_CANCELED = "tournament.registration.canceled"
    AUTO_DELETE_UNPAID = "tournament.registration.auto_delete_unpaid"


class TournamentTaskService:
    """Сервис для отправки задач в очередь tasks.active"""
    
    def __init__(self):
        self.queue_subject = "tasks.active"
    
    async def _send_task(self, task_name: str, execute_at: datetime, data: Dict[str, Any]):
        """
        Отправляет задачу в очередь NATS
        
        Args:
            task_name: Название задачи для воркера
            execute_at: Время выполнения задачи
            data: Дополнительные данные для задачи
        """
        # Быстрая проверка доступности без попытки подключения
        if not nats_client.is_available():
            logger.debug(f"NATS unavailable, skipping task {task_name}")
            return
            
        try:
            message = {
                "task_name": task_name,
                "execute_at": execute_at.strftime("%Y-%m-%dT%H:%M:%S"),
                "data": data,
                "created_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            }
            
            success = await nats_client.publish(
                subject=self.queue_subject,
                message=message
            )
            
            if success:
                logger.info(f"Task {task_name} successfully scheduled for {execute_at}")
            else:
                logger.warning(f"Failed to schedule task {task_name} for {execute_at}")
            
        except Exception as e:
            logger.error(f"Exception while sending task {task_name}: {str(e)}")
    
    async def send_registration_success_task(
        self, 
        user_id: UUID, 
        tournament_id: UUID,
        registration_id: UUID,
        tournament_name: str,
        user_telegram_id: int
    ):
        """
        Отправляет задачу об успешной регистрации (место занято)
        Выполняется сразу
        """
        await self._send_task(
            task_name=TournamentTaskNames.REGISTRATION_SUCCESS,
            execute_at=datetime.now(),
            data={
                "user_id": str(user_id),
                "tournament_id": str(tournament_id),
                "registration_id": str(registration_id),
                "tournament_name": tournament_name,
                "user_telegram_id": user_telegram_id,
            }
        )
    
    async def send_payment_reminder_tasks(
        self, 
        user_id: UUID, 
        tournament_id: UUID,
        registration_id: UUID,
        tournament_name: str,
        user_telegram_id: int,
        registration_time: datetime
    ):
        """
        Отправляет все задачи напоминания об оплате
        """
        # Напоминание через 12 часов
        reminder_1_time = registration_time + timedelta(hours=12)
        await self._send_task(
            task_name=TournamentTaskNames.PAYMENT_REMINDER_1,
            execute_at=reminder_1_time,
            data={
                "user_id": str(user_id),
                "tournament_id": str(tournament_id),
                "registration_id": str(registration_id),
                "tournament_name": tournament_name,
                "user_telegram_id": user_telegram_id,
            }
        )
        
        # Напоминание через 21 час
        reminder_2_time = registration_time + timedelta(hours=21)
        await self._send_task(
            task_name=TournamentTaskNames.PAYMENT_REMINDER_2,
            execute_at=reminder_2_time,
            data={
                "user_id": str(user_id),
                "tournament_id": str(tournament_id),
                "registration_id": str(registration_id),
                "tournament_name": tournament_name,
                "user_telegram_id": user_telegram_id,
            }
        )
        
        # Напоминание через 23 часа
        reminder_3_time = registration_time + timedelta(hours=23)
        await self._send_task(
            task_name=TournamentTaskNames.PAYMENT_REMINDER_3,
            execute_at=reminder_3_time,
            data={
                "user_id": str(user_id),
                "tournament_id": str(tournament_id),
                "registration_id": str(registration_id),
                "tournament_name": tournament_name,
                "user_telegram_id": user_telegram_id,
            }
        )
    
    async def send_payment_success_task(
        self, 
        user_id: UUID, 
        tournament_id: UUID,
        registration_id: UUID,
        tournament_name: str,
        user_telegram_id: int,
        payment_amount: float
    ):
        """
        Отправляет задачу об успешной оплате
        Выполняется сразу
        """
        await self._send_task(
            task_name=TournamentTaskNames.PAYMENT_SUCCESS,
            execute_at=datetime.now(),
            data={
                "user_id": str(user_id),
                "tournament_id": str(tournament_id),
                "registration_id": str(registration_id),
                "tournament_name": tournament_name,
                "user_telegram_id": user_telegram_id,
                "payment_amount": payment_amount,
            }
        )
    
    async def send_loyalty_level_changed_task(
        self, 
        user_id: UUID, 
        user_telegram_id: int,
        old_level: str,
        new_level: str,
        benefits: Optional[str] = None
    ):
        """
        Отправляет задачу об изменении уровня лояльности
        Выполняется сразу
        """
        await self._send_task(
            task_name=TournamentTaskNames.LOYALTY_LEVEL_CHANGED,
            execute_at=datetime.now(),
            data={
                "user_id": str(user_id),
                "user_telegram_id": user_telegram_id,
                "old_level": old_level,
                "new_level": new_level,
                "benefits": benefits,
            }
        )
    
    async def send_registration_canceled_task(
        self, 
        user_id: UUID, 
        tournament_id: UUID,
        registration_id: UUID,
        tournament_name: str,
        user_telegram_id: int,
        reason: str = "Регистрация отменена"
    ):
        """
        Отправляет задачу об отмене регистрации
        Выполняется сразу
        """
        await self._send_task(
            task_name=TournamentTaskNames.REGISTRATION_CANCELED,
            execute_at=datetime.now(),
            data={
                "user_id": str(user_id),
                "tournament_id": str(tournament_id),
                "registration_id": str(registration_id),
                "tournament_name": tournament_name,
                "user_telegram_id": user_telegram_id,
                "reason": reason,
            }
        )
    
    async def send_auto_delete_unpaid_task(
        self, 
        user_id: UUID, 
        tournament_id: UUID,
        registration_id: UUID,
        tournament_name: str,
        user_telegram_id: int,
        registration_time: datetime
    ):
        """
        Отправляет задачу автоматического удаления неоплаченной регистрации через 24 часа
        """
        delete_time = registration_time + timedelta(hours=24)
        await self._send_task(
            task_name=TournamentTaskNames.AUTO_DELETE_UNPAID,
            execute_at=delete_time,
            data={
                "user_id": str(user_id),
                "tournament_id": str(tournament_id),
                "registration_id": str(registration_id),
                "tournament_name": tournament_name,
                "user_telegram_id": user_telegram_id,
            }
        )
    
    async def cancel_pending_tasks(
        self, 
        user_id: UUID, 
        tournament_id: UUID,
        registration_id: UUID
    ):
        """
        Отменяет все отложенные задачи для конкретной регистрации
        Отправляет задачу отмены в очередь
        """
        await self._send_task(
            task_name="tournament.tasks.cancel",
            execute_at=datetime.now(),
            data={
                "user_id": str(user_id),
                "tournament_id": str(tournament_id),
                "registration_id": str(registration_id),
                "action": "cancel_pending_tasks"
            }
        )

tournament_task_service = TournamentTaskService() 