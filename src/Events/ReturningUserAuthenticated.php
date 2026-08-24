<?php

namespace Modules\Auth\Events;

use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturningUserAuthenticated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public User $user,
        public CarbonInterface $loggedInAt,
        public ?string $ipAddress,
        public ?string $userAgent,
    ) {}
}
