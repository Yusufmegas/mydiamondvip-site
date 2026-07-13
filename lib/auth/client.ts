'use client';

// Better Auth istemci — yalnızca giriş/çıkış için (kayıt fonksiyonu kullanılmaz).
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  basePath: '/api/auth',
});
