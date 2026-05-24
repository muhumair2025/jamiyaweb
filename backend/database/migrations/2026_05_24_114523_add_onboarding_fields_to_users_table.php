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
        Schema::table('users', function (Blueprint $table) {
            $table->string('selected_theme_id', 64)->nullable()->after('website_type');
            $table->string('brand_color', 32)->nullable()->after('selected_theme_id');
            $table->string('typography_style', 32)->nullable()->after('brand_color');
            $table->json('site_languages')->nullable()->after('typography_style');
            $table->string('tagline', 255)->nullable()->after('site_languages');
            $table->string('logo_path', 255)->nullable()->after('tagline');
            $table->boolean('donations_enabled')->default(false)->after('logo_path');
            $table->timestamp('onboarding_completed_at')->nullable()->after('donations_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'selected_theme_id',
                'brand_color',
                'typography_style',
                'site_languages',
                'tagline',
                'logo_path',
                'donations_enabled',
                'onboarding_completed_at',
            ]);
        });
    }
};
