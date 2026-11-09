<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => \App\Enums\UserRole::OPERATOR_TPS,
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the user has ADMIN_EHS role.
     */
    public function admin(): static
    {
        return $this->state(fn () => [
            'role' => \App\Enums\UserRole::ADMIN_EHS,
        ]);
    }

    /**
     * Indicate that the user has OPERATOR_TPS role.
     */
    public function operator(): static
    {
        return $this->state(fn () => [
            'role' => \App\Enums\UserRole::OPERATOR_TPS,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
