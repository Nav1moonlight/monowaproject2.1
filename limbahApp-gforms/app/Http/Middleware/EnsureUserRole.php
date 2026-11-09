<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
                'status' => 'error',
            ], 401);
        }

        if (!empty($roles)) {
            $userRoleValue = is_string($user->role) ? $user->role : ($user->role?->value ?? null);

            if (! $userRoleValue || ! in_array($userRoleValue, $roles, true)) {
                return response()->json([
                    'message' => 'Anda tidak memiliki hak akses (role) untuk melakukan operasi ini.',
                    'status' => 'forbidden',
                ], 403);
            }
        }

        return $next($request);
    }
}
