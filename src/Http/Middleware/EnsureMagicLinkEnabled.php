<?php

namespace Modules\Auth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Auth\Settings\AuthSettings;

class EnsureMagicLinkEnabled
{
    public function __construct(private readonly AuthSettings $settings) {}

    public function handle(Request $request, Closure $next): mixed
    {
        abort_unless($this->settings->magic_link_enabled, 404);

        return $next($request);
    }
}
