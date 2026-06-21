<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\NewOrderNotification;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\OrderStatusUpdatedNotification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'city',
        'phone',
        'address',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->is_admin === true;
    }

    /**
     * Get orders for the user
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get material stock logs for the user
     */
    public function materialStockLogs()
    {
        return $this->hasMany(MaterialStockLog::class);
    }

    /**
     * Get cart items for the user
     */
    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Route notifications for mail channel (optional)
     */
    public function routeNotificationForMail()
    {
        return $this->email;
    }
}
