<?php

namespace Modules\Auth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Auth\Services\SocialiteService;
use Symfony\Component\HttpFoundation\Response;

class EnsureSocialiteProviderEnabled
{
    public function __construct(private readonly SocialiteService $socialiteService) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $provider = $request->route('provider');

        abort_unless(
            is_string($provider) && $this->socialiteService->isProviderEnabled($provider),
            404,
        );

        return $next($request);
    }
}
