/**
 * Утилита для открытия ссылок на iOS устройствах
 * Обходит ограничения Safari на всплывающие окна
 */

import { openTelegramLink } from "@telegram-apps/sdk-react";

/**
 * Определяет, является ли устройство iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Определяет, запущено ли приложение в Safari
 */
export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * Открывает ссылку оплаты с поддержкой iOS
 * @param paymentLink - ссылка на оплату
 */
export const openPaymentLink = (paymentLink: string): void => {
  try {
    // Сначала пробуем через Telegram SDK
    openTelegramLink(paymentLink);
  } catch (error) {
    console.log('openTelegramLink failed, using fallback method:', error);
    
    // Для iOS используем специальный подход
    if (isIOS() || isSafari()) {
      // Создаем невидимую ссылку и кликаем по ней
      const link = document.createElement('a');
      link.href = paymentLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      // Добавляем в DOM, кликаем и сразу удаляем
      document.body.appendChild(link);
      
      // Используем setTimeout для обхода блокировки
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
      }, 100);
    } else {
      // Для других устройств используем обычный window.open
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    }
  }
};

/**
 * Открывает ссылку оплаты через location.href (альтернативный метод)
 * @param paymentLink - ссылка на оплату
 */
export const openPaymentLinkDirect = (paymentLink: string): void => {
  // Этот метод открывает ссылку в том же окне
  window.location.href = paymentLink;
}; 