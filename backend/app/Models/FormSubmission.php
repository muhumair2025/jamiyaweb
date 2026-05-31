<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSubmission extends Model
{
    use HasFactory;

    public const STATUS_NEW = 'new';
    public const STATUS_READ = 'read';
    public const STATUS_ARCHIVED = 'archived';
    public const STATUS_SPAM = 'spam';

    protected $fillable = [
        'website_id',
        'section_id',
        'form_name',
        'sender_name',
        'sender_email',
        'sender_phone',
        'sender_subject',
        'message',
        'payload',
        'ip_address',
        'user_agent',
        'referrer',
        'status',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'read_at' => 'datetime',
        ];
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }
}
