<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();        // matches React component registration
            $table->string('name');
            $table->string('version', 32)->default('1.0.0');
            $table->string('category', 64)->nullable(); // hero, content, donation, footer…
            $table->string('icon', 32)->nullable();     // lucide icon name
            $table->json('schema_json');                // Zod-serialised schema for `settings`
            $table->json('default_settings_json');      // sensible defaults
            $table->string('preview_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
