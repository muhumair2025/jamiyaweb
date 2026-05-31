<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->cascadeOnDelete();

            // Section ids are UUIDs inside content_json, so store as string.
            // Nullable in case the section was deleted before the submission.
            $table->string('section_id', 64)->nullable();
            $table->string('form_name', 100)->default('contact');

            // Flat denormalized columns for the common contact-form fields —
            // makes filtering + admin lists fast without unpacking JSON.
            $table->string('sender_name')->nullable();
            $table->string('sender_email')->nullable();
            $table->string('sender_phone', 64)->nullable();
            $table->string('sender_subject')->nullable();
            $table->text('message')->nullable();

            // Full payload (any extra/custom fields the form might add later).
            $table->json('payload')->nullable();

            // Audit trail / abuse defence
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->string('referrer', 512)->nullable();

            // Workflow
            $table->enum('status', ['new', 'read', 'archived', 'spam'])->default('new');
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->index(['website_id', 'status', 'created_at']);
            $table->index(['website_id', 'created_at']);
            $table->index('sender_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};
