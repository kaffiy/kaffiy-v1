import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type ErrorType = 
  | 'network'
  | 'validation'
  | 'permission'
  | 'not_found'
  | 'server_error'
  | 'unknown';

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const getErrorMessage = useCallback((error: ErrorInfo): string => {
    switch (error.type) {
      case 'network':
        return 'İnternet bağlantınızda bir sorun var. Lütfen bağlantınızı kontrol edin.';
      case 'validation':
        return 'Girdiğiniz bilgilerde hatalar var. Lütfen kontrol edip tekrar deneyin.';
      case 'permission':
        return 'Bu işlemi yapmak için yetkiniz yok. Yöneticinize başvurun.';
      case 'not_found':
        return 'Aradığınız içerik bulunamadı.';
      case 'server_error':
        return 'Sunucuda bir hata oluştu. Lütfen biraz sonra tekrar deneyin.';
      case 'unknown':
      default:
        return 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }, []);

  const getErrorIcon = useCallback((type: ErrorType) => {
    switch (type) {
      case 'network':
        return '🌐';
      case 'validation':
        return '⚠️';
      case 'permission':
        return '🔒';
      case 'not_found':
        return '🔍';
      case 'server_error':
        return '🔥';
      case 'unknown':
      default:
        return '❌';
    }
  }, []);

  const handleError = useCallback((error: ErrorInfo | Error | unknown, customMessage?: string) => {
    let errorInfo: ErrorInfo;

    if (error && typeof error === 'object' && 'type' in error) {
      errorInfo = error as ErrorInfo;
    } else if (error instanceof Error) {
      errorInfo = {
        type: 'unknown',
        message: error.message,
        details: error.stack,
      };
    } else {
      errorInfo = {
        type: 'unknown',
        message: 'Bilinmeyen hata',
        details: error,
      };
    }

    const message = customMessage || getErrorMessage(errorInfo);
    const icon = getErrorIcon(errorInfo.type);

    // Show toast notification
    toast({
      title: message,
      description: icon,
      variant: 'destructive',
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Dashboard Error:', errorInfo);
    }

    // Log to monitoring service in production
    if (import.meta.env.PROD) {
      // TODO: Add error logging service
      console.warn('Error logging service not configured');
    }

    return errorInfo;
  }, [toast, getErrorMessage, getErrorIcon]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, errorMessage);
      return null;
    }
  }, [handleError]);

  const handleNetworkError = useCallback((message?: string) => {
    handleError({
      type: 'network',
      message: message || 'Network error occurred',
    });
  }, [handleError]);

  const handleValidationError = useCallback((message?: string) => {
    handleError({
      type: 'validation',
      message: message || 'Validation error occurred',
    });
  }, [handleError]);

  const handlePermissionError = useCallback((message?: string) => {
    handleError({
      type: 'permission',
      message: message || 'Permission denied',
    });
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    handleNetworkError,
    handleValidationError,
    handlePermissionError,
  };
};
