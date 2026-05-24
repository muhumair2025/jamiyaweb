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
            $table->string('site_name', 255)->nullable()->after('organization_name');
            $table->string('accent_color', 32)->nullable()->after('brand_color');
            $table->string('background_tone', 32)->nullable()->after('accent_color');
            $table->string('favicon_path', 255)->nullable()->after('logo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'site_name',
                'accent_color',
                'background_tone',
                'favicon_path',
            ]);
        });
    }
};
