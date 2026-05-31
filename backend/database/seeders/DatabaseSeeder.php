<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Engine bootstrap — sections + Starter / Compassion themes.
        $this->call(EngineSeeder::class);

        // Rahmah — premium welfare theme with 5 pre-baked pages.
        // Idempotent; safe to run repeatedly.
        $this->call(RahmahThemeSeeder::class);

        // Seed a test user only outside production.
        if (app()->environment('local', 'testing')) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }
    }
}
