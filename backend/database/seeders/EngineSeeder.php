<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\Theme;
use Illuminate\Database\Seeder;

/**
 * Seeds the initial theme engine with one theme + two reusable sections.
 * The actual React implementations live in frontend/src/sections/{slug}.
 *
 * Idempotent — safe to re-run via `php artisan db:seed --class=EngineSeeder`.
 */
class EngineSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Section: hero-basic ──────────────────────────────
        $hero = Section::updateOrCreate(
            ['slug' => 'hero-basic'],
            [
                'name' => 'Hero — Basic',
                'version' => '1.0.0',
                'category' => 'hero',
                'icon' => 'Sparkles',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'title', 'subtitle', 'alignment', 'cta_label', 'cta_href', 'background_image', 'slides', 'autoplay', 'interval_ms', 'transition'],
                    'properties' => [
                        'eyebrow' => [
                            'type' => 'string',
                            'title' => 'Eyebrow',
                            'maxLength' => 80,
                            'placeholder' => 'Ramadan 2026',
                            'description' => 'Small label shown above the title.',
                        ],
                        'title' => [
                            'type' => 'string',
                            'title' => 'Title',
                            'minLength' => 1,
                            'maxLength' => 200,
                            'placeholder' => 'Support our students',
                        ],
                        'subtitle' => [
                            'type' => 'string',
                            'title' => 'Subtitle',
                            'format' => 'textarea',
                            'maxLength' => 500,
                            'description' => 'A short paragraph below the title.',
                        ],
                        'cta_label' => [
                            'type' => 'string',
                            'title' => 'CTA label',
                            'maxLength' => 64,
                            'placeholder' => 'Donate now',
                        ],
                        'cta_href' => [
                            'type' => 'string',
                            'title' => 'CTA link',
                            'format' => 'url',
                            'maxLength' => 255,
                            'placeholder' => 'https://…',
                        ],
                        'background_image' => [
                            'type' => 'string',
                            'title' => 'Background image',
                            'format' => 'image',
                            'nullable' => true,
                            'description' => 'Optional image behind the hero.',
                        ],
                        'alignment' => [
                            'type' => 'string',
                            'title' => 'Alignment',
                            'enum' => ['start', 'center'],
                            'enumLabels' => ['start' => 'Start', 'center' => 'Center'],
                        ],
                        // `variant` is picked from the Variants tab in the builder,
                        // not the Content form — kept here so the value persists
                        // through validation. `hidden: true` keeps the auto-form
                        // generator from drawing a field for it.
                        'variant' => [
                            'type' => 'string',
                            'title' => 'Variant',
                            'enum' => ['classic', 'cinematic', 'minimal', 'slider'],
                            'enumLabels' => [
                                'classic' => 'Classic',
                                'cinematic' => 'Cinematic',
                                'minimal' => 'Minimal',
                                'slider' => 'Slider',
                            ],
                            'hidden' => true,
                            'description' => 'Pre-built visual layout. Pick one in the Variants tab.',
                        ],
                        // ─── Slider-variant fields ────────────────────────
                        // These are always present in the form but only have
                        // effect when variant="slider".
                        'slides' => [
                            'type' => 'array',
                            'title' => 'Slides',
                            'minItems' => 0,
                            'maxItems' => 10,
                            'addLabel' => 'Add slide',
                            'itemLabel' => 'Slide {index}: {title}',
                            'description' => 'Used by the Slider variant. Each slide has its own image and copy.',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['background_image', 'eyebrow', 'title', 'subtitle', 'cta_label', 'cta_href'],
                                'properties' => [
                                    'background_image' => [
                                        'type' => 'string',
                                        'title' => 'Background image',
                                        'format' => 'image',
                                        'nullable' => true,
                                    ],
                                    'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                                    'title' => ['type' => 'string', 'title' => 'Title', 'maxLength' => 200],
                                    'subtitle' => ['type' => 'string', 'title' => 'Subtitle', 'format' => 'textarea', 'maxLength' => 500],
                                    'cta_label' => ['type' => 'string', 'title' => 'CTA label', 'maxLength' => 64],
                                    'cta_href' => ['type' => 'string', 'title' => 'CTA link', 'format' => 'url', 'maxLength' => 255],
                                ],
                            ],
                        ],
                        'autoplay' => [
                            'type' => 'boolean',
                            'title' => 'Autoplay slides',
                            'description' => 'Slider variant only.',
                        ],
                        'interval_ms' => [
                            'type' => 'integer',
                            'title' => 'Slide interval (ms)',
                            'minimum' => 2000,
                            'maximum' => 20000,
                            'description' => 'Slider variant only. How long each slide stays visible.',
                        ],
                        'transition' => [
                            'type' => 'string',
                            'title' => 'Slide transition',
                            'enum' => ['fade', 'slide'],
                            'enumLabels' => ['fade' => 'Crossfade', 'slide' => 'Horizontal slide'],
                            'description' => 'Slider variant only.',
                        ],
                    ],
                    'required' => ['title'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'Welcome',
                    'title' => 'Your hero title goes here',
                    'subtitle' => 'A short, persuasive sentence about what you do.',
                    'cta_label' => 'Get started',
                    'cta_href' => '#',
                    'background_image' => null,
                    'alignment' => 'center',
                    'variant' => 'classic',
                    'slides' => [
                        [
                            'background_image' => null,
                            'eyebrow' => 'Ramadan 2026',
                            'title' => 'Empower a generation of students',
                            'subtitle' => 'Sponsor a student, support a family, fund a campaign.',
                            'cta_label' => 'Donate now',
                            'cta_href' => '#',
                        ],
                        [
                            'background_image' => null,
                            'eyebrow' => 'Our mission',
                            'title' => 'Mercy that reaches further',
                            'subtitle' => 'Your generosity changes lives, in shaa Allah.',
                            'cta_label' => 'Learn more',
                            'cta_href' => '#',
                        ],
                    ],
                    'autoplay' => true,
                    'interval_ms' => 5500,
                    'transition' => 'fade',
                ],
            ]
        );

        // ─── Section: paragraph ───────────────────────────────
        $paragraph = Section::updateOrCreate(
            ['slug' => 'paragraph'],
            [
                'name' => 'Paragraph',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'AlignLeft',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['heading', 'body', 'max_width'],
                    'properties' => [
                        'heading' => [
                            'type' => 'string',
                            'title' => 'Heading',
                            'maxLength' => 200,
                            'placeholder' => 'About us',
                        ],
                        'body' => [
                            'type' => 'string',
                            'title' => 'Body',
                            'format' => 'textarea',
                            'minLength' => 1,
                            'description' => 'Plain text or basic line breaks.',
                        ],
                        'max_width' => [
                            'type' => 'string',
                            'title' => 'Max width',
                            'enum' => ['narrow', 'normal', 'wide'],
                            'enumLabels' => [
                                'narrow' => 'Narrow',
                                'normal' => 'Normal',
                                'wide' => 'Wide',
                            ],
                            'description' => 'How wide the content column should be.',
                        ],
                    ],
                    'required' => ['body'],
                ],
                'default_settings_json' => [
                    'heading' => 'About us',
                    'body' => 'Tell your story here. A paragraph or two about your mission, history, or values.',
                    'max_width' => 'normal',
                ],
            ]
        );

        // ─── Section: feature-grid ────────────────────────────
        $featureGrid = Section::updateOrCreate(
            ['slug' => 'feature-grid'],
            [
                'name' => 'Feature grid (3 columns)',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'LayoutGrid',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => [
                        'eyebrow', 'heading', 'subheading',
                        'feature_1_icon', 'feature_1_title', 'feature_1_desc',
                        'feature_2_icon', 'feature_2_title', 'feature_2_desc',
                        'feature_3_icon', 'feature_3_title', 'feature_3_desc',
                    ],
                    'properties' => [
                        'eyebrow' => [
                            'type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80,
                            'placeholder' => 'What we do',
                        ],
                        'heading' => [
                            'type' => 'string', 'title' => 'Heading', 'maxLength' => 200,
                            'placeholder' => 'What we offer',
                        ],
                        'subheading' => [
                            'type' => 'string', 'title' => 'Subheading',
                            'format' => 'textarea', 'maxLength' => 400,
                        ],
                        'feature_1_icon' => self::iconProp('Feature 1 — icon', 'Sparkles'),
                        'feature_1_title' => ['type' => 'string', 'title' => 'Feature 1 — title', 'maxLength' => 80],
                        'feature_1_desc' => ['type' => 'string', 'title' => 'Feature 1 — description', 'format' => 'textarea', 'maxLength' => 300],
                        'feature_2_icon' => self::iconProp('Feature 2 — icon', 'Heart'),
                        'feature_2_title' => ['type' => 'string', 'title' => 'Feature 2 — title', 'maxLength' => 80],
                        'feature_2_desc' => ['type' => 'string', 'title' => 'Feature 2 — description', 'format' => 'textarea', 'maxLength' => 300],
                        'feature_3_icon' => self::iconProp('Feature 3 — icon', 'Award'),
                        'feature_3_title' => ['type' => 'string', 'title' => 'Feature 3 — title', 'maxLength' => 80],
                        'feature_3_desc' => ['type' => 'string', 'title' => 'Feature 3 — description', 'format' => 'textarea', 'maxLength' => 300],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'What we offer',
                    'heading' => 'Built around your community',
                    'subheading' => 'Three things every Jamiya needs from day one.',
                    'feature_1_icon' => 'BookOpen',
                    'feature_1_title' => 'Daily classes',
                    'feature_1_desc' => 'Quran, Tafsir, Fiqh and Arabic — scheduled and searchable.',
                    'feature_2_icon' => 'HandHeart',
                    'feature_2_title' => 'Easy donations',
                    'feature_2_desc' => 'Accept zakat, sadaqah and campaign giving in a single click.',
                    'feature_3_icon' => 'Users',
                    'feature_3_title' => 'A real community',
                    'feature_3_desc' => 'Events, volunteer signup and newsletters — all in one place.',
                ],
            ]
        );

        // ─── Section: cta-band ────────────────────────────────
        $ctaBand = Section::updateOrCreate(
            ['slug' => 'cta-band'],
            [
                'name' => 'CTA band',
                'version' => '1.0.0',
                'category' => 'cta',
                'icon' => 'Megaphone',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['heading', 'subheading', 'button_label', 'button_href', 'style'],
                    'properties' => [
                        'heading' => [
                            'type' => 'string', 'title' => 'Heading',
                            'minLength' => 1, 'maxLength' => 200,
                            'placeholder' => 'Ready to get started?',
                        ],
                        'subheading' => [
                            'type' => 'string', 'title' => 'Subheading',
                            'format' => 'textarea', 'maxLength' => 400,
                        ],
                        'button_label' => [
                            'type' => 'string', 'title' => 'Button label',
                            'maxLength' => 64, 'placeholder' => 'Get started',
                        ],
                        'button_href' => [
                            'type' => 'string', 'title' => 'Button link',
                            'format' => 'url', 'maxLength' => 255,
                            'placeholder' => 'https://…',
                        ],
                        'style' => [
                            'type' => 'string', 'title' => 'Style',
                            'enum' => ['dark', 'light'],
                            'enumLabels' => ['dark' => 'Dark band', 'light' => 'Light band'],
                            'description' => 'Dark uses your primary colour; Light uses the page background.',
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'heading' => 'Support our students this month',
                    'subheading' => 'Every donation funds books, meals and tuition for a real Jamiya.',
                    'button_label' => 'Donate now',
                    'button_href' => '#donate',
                    'style' => 'dark',
                ],
            ]
        );

        // ─── Section: stats-counter ──────────────────────────────
        $statsCounter = Section::updateOrCreate(
            ['slug' => 'stats-counter'],
            [
                'name' => 'Stats counter',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'TrendingUp',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'subheading', 'layout', 'stats'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'subheading' => ['type' => 'string', 'title' => 'Subheading', 'format' => 'textarea', 'maxLength' => 400],
                        'layout' => [
                            'type' => 'string',
                            'title' => 'Layout',
                            'enum' => ['minimal', 'cards', 'ribbon'],
                            'enumLabels' => [
                                'minimal' => 'Minimal (institutional)',
                                'cards' => 'Cards (boxed)',
                                'ribbon' => 'Ribbon (single row)',
                            ],
                            'description' => 'Visual style for the stats grid.',
                        ],
                        'stats' => [
                            'type' => 'array',
                            'title' => 'Stats',
                            'minItems' => 1,
                            'maxItems' => 8,
                            'addLabel' => 'Add stat',
                            'itemLabel' => 'Stat {index}: {label}',
                            'description' => 'Numbers animate from 0 when the section scrolls into view.',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['number', 'suffix', 'label', 'description'],
                                'properties' => [
                                    'number' => ['type' => 'integer', 'title' => 'Number', 'minimum' => 0],
                                    'suffix' => ['type' => 'string', 'title' => 'Suffix', 'maxLength' => 8, 'placeholder' => '+ or K or %'],
                                    'label' => ['type' => 'string', 'title' => 'Label', 'maxLength' => 80],
                                    'description' => ['type' => 'string', 'title' => 'Description', 'format' => 'textarea', 'maxLength' => 200],
                                ],
                                'required' => ['number', 'label'],
                            ],
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'Impact so far',
                    'heading' => 'Our work in numbers',
                    'subheading' => 'Every figure traces back to a donor, a volunteer, or a Jamiya we partner with.',
                    'layout' => 'minimal',
                    'stats' => [
                        ['number' => 12500, 'suffix' => '+', 'label' => 'Donors', 'description' => 'Generous supporters across 18 countries.'],
                        ['number' => 380, 'suffix' => '', 'label' => 'Students sponsored', 'description' => 'Full-tuition scholarships this year alone.'],
                        ['number' => 24, 'suffix' => '', 'label' => 'Partner Jamiyas', 'description' => 'Trusted institutions we work with.'],
                        ['number' => 96, 'suffix' => '%', 'label' => 'Goes to programs', 'description' => 'Audited, transparent, and reported quarterly.'],
                    ],
                ],
            ]
        );

        // ─── Section: programs-grid ──────────────────────────────
        $programsGrid = Section::updateOrCreate(
            ['slug' => 'programs-grid'],
            [
                'name' => 'Programs grid',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'LayoutGrid',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'subheading', 'mode', 'columns', 'programs'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'subheading' => ['type' => 'string', 'title' => 'Subheading', 'format' => 'textarea', 'maxLength' => 400],
                        'mode' => [
                            'type' => 'string',
                            'title' => 'Display mode',
                            'enum' => ['card', 'project'],
                            'enumLabels' => [
                                'card' => 'Card (image + link)',
                                'project' => 'Donation project (progress bar + donate CTA)',
                            ],
                            'description' => 'Project mode shows raised / goal / progress and a Donate button per item.',
                        ],
                        'columns' => [
                            'type' => 'string',
                            'title' => 'Columns',
                            'enum' => ['2', '3', '4'],
                            'enumLabels' => ['2' => '2 columns', '3' => '3 columns', '4' => '4 columns'],
                        ],
                        'programs' => [
                            'type' => 'array',
                            'title' => 'Programs',
                            'minItems' => 1,
                            'maxItems' => 12,
                            'addLabel' => 'Add program',
                            'itemLabel' => 'Program {index}: {title}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['image', 'title', 'description', 'link_label', 'link_href', 'raised', 'goal', 'currency', 'donate_label', 'donate_href'],
                                'properties' => [
                                    'image' => ['type' => 'string', 'title' => 'Image', 'format' => 'image', 'nullable' => true],
                                    'title' => ['type' => 'string', 'title' => 'Title', 'maxLength' => 120],
                                    'description' => ['type' => 'string', 'title' => 'Description', 'format' => 'textarea', 'maxLength' => 400],
                                    'link_label' => ['type' => 'string', 'title' => 'Link label', 'maxLength' => 64, 'placeholder' => 'Learn more'],
                                    'link_href' => ['type' => 'string', 'title' => 'Link URL', 'format' => 'url', 'maxLength' => 255],
                                    'raised' => ['type' => 'integer', 'title' => 'Raised', 'minimum' => 0, 'description' => 'Project mode only.'],
                                    'goal' => ['type' => 'integer', 'title' => 'Goal', 'minimum' => 0, 'description' => 'Project mode only. Leave 0 to hide the progress bar.'],
                                    'currency' => ['type' => 'string', 'title' => 'Currency symbol', 'maxLength' => 8, 'placeholder' => 'SAR', 'description' => 'Project mode only.'],
                                    'donate_label' => ['type' => 'string', 'title' => 'Donate button label', 'maxLength' => 32, 'placeholder' => 'Donate now', 'description' => 'Project mode only.'],
                                    'donate_href' => ['type' => 'string', 'title' => 'Donate URL', 'format' => 'url', 'maxLength' => 255, 'description' => 'Project mode only.'],
                                ],
                                'required' => ['title'],
                            ],
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'What we do',
                    'heading' => 'Our programs',
                    'subheading' => 'From scholarships to relief campaigns — the work your donations support.',
                    'mode' => 'card',
                    'columns' => '3',
                    'programs' => [
                        ['image' => null, 'title' => 'Orphan sponsorship', 'description' => 'Monthly support covering food, shelter and schooling for children in our care.', 'link_label' => 'Sponsor a child', 'link_href' => '#sponsor', 'raised' => 0, 'goal' => 0, 'currency' => '', 'donate_label' => '', 'donate_href' => ''],
                        ['image' => null, 'title' => 'Madrasah scholarships', 'description' => 'Full-tuition support for Quran and Islamic-sciences students at partner Jamiyas.', 'link_label' => 'Apply', 'link_href' => '#scholarships', 'raised' => 0, 'goal' => 0, 'currency' => '', 'donate_label' => '', 'donate_href' => ''],
                        ['image' => null, 'title' => 'Emergency relief', 'description' => 'Rapid-response food, water and medical aid for crisis zones we operate in.', 'link_label' => 'Donate', 'link_href' => '#relief', 'raised' => 0, 'goal' => 0, 'currency' => '', 'donate_label' => '', 'donate_href' => ''],
                    ],
                ],
            ]
        );

        // ─── Section: testimonials ───────────────────────────────
        $testimonials = Section::updateOrCreate(
            ['slug' => 'testimonials'],
            [
                'name' => 'Testimonials',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'Quote',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'layout', 'testimonials'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'layout' => [
                            'type' => 'string',
                            'title' => 'Layout',
                            'enum' => ['carousel', 'grid'],
                            'enumLabels' => ['carousel' => 'Carousel (one at a time)', 'grid' => 'Grid (2-up)'],
                        ],
                        'testimonials' => [
                            'type' => 'array',
                            'title' => 'Testimonials',
                            'minItems' => 1,
                            'maxItems' => 20,
                            'addLabel' => 'Add testimonial',
                            'itemLabel' => 'Testimonial {index}: {author}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['quote', 'author', 'role', 'avatar'],
                                'properties' => [
                                    'quote' => ['type' => 'string', 'title' => 'Quote', 'format' => 'textarea', 'maxLength' => 600],
                                    'author' => ['type' => 'string', 'title' => 'Author', 'maxLength' => 120],
                                    'role' => ['type' => 'string', 'title' => 'Role / location', 'maxLength' => 120],
                                    'avatar' => ['type' => 'string', 'title' => 'Avatar', 'format' => 'image', 'nullable' => true],
                                ],
                                'required' => ['quote', 'author'],
                            ],
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'What our donors say',
                    'heading' => 'Trust, transparency, real change',
                    'layout' => 'carousel',
                    'testimonials' => [
                        ['quote' => 'Every quarter, we get an audited report. I know exactly where my zakat went and which student it reached.', 'author' => 'Asma R.', 'role' => 'Donor — Karachi', 'avatar' => null],
                        ['quote' => 'I sponsored a student two years ago. Last month his teacher sent me a voice note of him reciting Surah Al-Kahf. That moment changed me.', 'author' => 'Yusuf I.', 'role' => 'Donor — London', 'avatar' => null],
                        ['quote' => 'The platform makes it so easy. One-click donations, clear progress, no awkward follow-ups. This is how charity should feel.', 'author' => 'Fatima S.', 'role' => 'Donor — Dubai', 'avatar' => null],
                    ],
                ],
            ]
        );

        // ─── Section: donation-widget ────────────────────────────
        $donationWidget = Section::updateOrCreate(
            ['slug' => 'donation-widget'],
            [
                'name' => 'Donation widget',
                'version' => '1.0.0',
                'category' => 'cta',
                'icon' => 'Heart',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'description', 'currency', 'goal', 'raised', 'quick_amounts', 'cta_label', 'cta_href', 'layout'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'description' => ['type' => 'string', 'title' => 'Description', 'format' => 'textarea', 'maxLength' => 600],
                        'currency' => ['type' => 'string', 'title' => 'Currency code', 'maxLength' => 6, 'placeholder' => 'PKR · USD · SAR'],
                        'goal' => ['type' => 'integer', 'title' => 'Goal amount', 'minimum' => 1],
                        'raised' => ['type' => 'integer', 'title' => 'Raised so far', 'minimum' => 0, 'description' => 'Static for now — replaced by live totals when payments ship.'],
                        'quick_amounts' => ['type' => 'string', 'title' => 'Quick amounts', 'maxLength' => 200, 'placeholder' => '500, 1000, 5000', 'description' => 'Comma-separated. Shown as quick-pick chips below the progress bar.'],
                        'cta_label' => ['type' => 'string', 'title' => 'Button label', 'maxLength' => 64],
                        'cta_href' => ['type' => 'string', 'title' => 'Donate link', 'format' => 'url', 'maxLength' => 255],
                        'layout' => [
                            'type' => 'string',
                            'title' => 'Layout',
                            'enum' => ['card', 'banner'],
                            'enumLabels' => ['card' => 'Card (centred)', 'banner' => 'Banner (full-width)'],
                        ],
                    ],
                    'required' => ['heading', 'goal'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'Active campaign',
                    'heading' => 'Help us hit our Ramadan goal',
                    'description' => 'Every contribution funds meals, books and tuition for students at our partner Jamiyas this Ramadan.',
                    'currency' => 'PKR',
                    'goal' => 5000000,
                    'raised' => 1850000,
                    'quick_amounts' => '500, 1000, 5000, 10000, 25000',
                    'cta_label' => 'Donate now',
                    'cta_href' => '#donate',
                    'layout' => 'card',
                ],
            ]
        );

        // ─── Section: contact-form ───────────────────────────────
        $contactForm = Section::updateOrCreate(
            ['slug' => 'contact-form'],
            [
                'name' => 'Contact form',
                'version' => '1.0.0',
                'category' => 'cta',
                'icon' => 'Mail',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => [
                        'eyebrow', 'heading', 'subheading',
                        'show_phone', 'show_subject', 'require_phone',
                        'submit_label', 'success_heading', 'success_message',
                        'contact_email', 'contact_phone',
                    ],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'subheading' => ['type' => 'string', 'title' => 'Subheading', 'format' => 'textarea', 'maxLength' => 400],
                        'show_phone' => ['type' => 'boolean', 'title' => 'Show phone field'],
                        'show_subject' => ['type' => 'boolean', 'title' => 'Show subject field'],
                        'require_phone' => ['type' => 'boolean', 'title' => 'Make phone required', 'description' => 'Only applies when phone field is shown.'],
                        'submit_label' => ['type' => 'string', 'title' => 'Submit button label', 'maxLength' => 64],
                        'success_heading' => ['type' => 'string', 'title' => 'Success heading', 'maxLength' => 120],
                        'success_message' => ['type' => 'string', 'title' => 'Success message', 'format' => 'textarea', 'maxLength' => 400],
                        'contact_email' => ['type' => 'string', 'title' => 'Contact email (display only)', 'maxLength' => 120, 'description' => 'Shown below the form as a mailto link. Submissions go to the dashboard regardless.'],
                        'contact_phone' => ['type' => 'string', 'title' => 'Contact phone (display only)', 'maxLength' => 64],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'Get in touch',
                    'heading' => 'We\'d love to hear from you',
                    'subheading' => 'Questions about donations, sponsorship, or partnership? Drop us a message — we reply within 1–2 business days.',
                    'show_phone' => true,
                    'show_subject' => true,
                    'require_phone' => false,
                    'submit_label' => 'Send message',
                    'success_heading' => 'Thanks — we got your message',
                    'success_message' => 'Jazak Allah khair. We\'ll be in touch shortly.',
                    'contact_email' => '',
                    'contact_phone' => '',
                ],
            ]
        );

        // ─── Section: site-header (global) ───────────────────────
        Section::updateOrCreate(
            ['slug' => 'site-header'],
            [
                'name' => 'Site header',
                'version' => '1.0.0',
                'category' => 'layout',
                'icon' => 'LayoutPanelTop',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['logo', 'logo_text', 'sticky', 'layout', 'links', 'cta_label', 'cta_href', 'show_utility_bar', 'utility_phone', 'utility_email', 'utility_language_label', 'utility_language_href', 'utility_login_label', 'utility_login_href', 'utility_links'],
                    'properties' => [
                        'logo' => ['type' => 'string', 'title' => 'Logo', 'format' => 'image', 'nullable' => true],
                        'logo_text' => ['type' => 'string', 'title' => 'Logo text (fallback)', 'maxLength' => 80, 'description' => 'Shown if no logo image is set.'],
                        'sticky' => ['type' => 'boolean', 'title' => 'Sticky on scroll'],
                        'layout' => [
                            'type' => 'string', 'title' => 'Nav alignment',
                            'enum' => ['right', 'center'],
                            'enumLabels' => ['right' => 'Right', 'center' => 'Center'],
                        ],
                        'links' => [
                            'type' => 'array',
                            'title' => 'Navigation links',
                            'maxItems' => 8,
                            'addLabel' => 'Add link',
                            'itemLabel' => 'Link {index}: {label}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['label', 'href'],
                                'properties' => [
                                    'label' => ['type' => 'string', 'title' => 'Label', 'maxLength' => 64],
                                    'href' => ['type' => 'string', 'title' => 'URL', 'format' => 'url', 'maxLength' => 255],
                                ],
                                'required' => ['label', 'href'],
                            ],
                        ],
                        'cta_label' => ['type' => 'string', 'title' => 'CTA button label', 'maxLength' => 32, 'placeholder' => 'Donate'],
                        'cta_href' => ['type' => 'string', 'title' => 'CTA button URL', 'format' => 'url', 'maxLength' => 255],
                        // ─── Utility bar (welfare-site pattern) ───
                        'show_utility_bar' => ['type' => 'boolean', 'title' => 'Show utility bar above nav', 'description' => 'Thin strip with phone, language switch, login. Hidden on mobile.'],
                        'utility_phone' => ['type' => 'string', 'title' => 'Utility — phone', 'maxLength' => 32],
                        'utility_email' => ['type' => 'string', 'title' => 'Utility — email', 'maxLength' => 120],
                        'utility_language_label' => ['type' => 'string', 'title' => 'Language switch label', 'maxLength' => 32, 'placeholder' => 'English'],
                        'utility_language_href' => ['type' => 'string', 'title' => 'Language switch URL', 'format' => 'url', 'maxLength' => 255],
                        'utility_login_label' => ['type' => 'string', 'title' => 'Login button label', 'maxLength' => 32, 'placeholder' => 'Login'],
                        'utility_login_href' => ['type' => 'string', 'title' => 'Login URL', 'format' => 'url', 'maxLength' => 255],
                        'utility_links' => [
                            'type' => 'array',
                            'title' => 'Utility bar links',
                            'maxItems' => 6,
                            'addLabel' => 'Add utility link',
                            'itemLabel' => '{label}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['label', 'href'],
                                'properties' => [
                                    'label' => ['type' => 'string', 'title' => 'Label', 'maxLength' => 32],
                                    'href' => ['type' => 'string', 'title' => 'URL', 'format' => 'url', 'maxLength' => 255],
                                ],
                                'required' => ['label', 'href'],
                            ],
                        ],
                    ],
                    'required' => [],
                ],
                'default_settings_json' => [
                    'logo' => null,
                    'logo_text' => 'Your site',
                    'sticky' => true,
                    'layout' => 'right',
                    'links' => [
                        ['label' => 'About', 'href' => '/about'],
                        ['label' => 'Programs', 'href' => '/programs'],
                        ['label' => 'Donate', 'href' => '/donate'],
                        ['label' => 'Contact', 'href' => '/contact'],
                    ],
                    'cta_label' => 'Donate',
                    'cta_href' => '/donate',
                    'show_utility_bar' => false,
                    'utility_phone' => '',
                    'utility_email' => '',
                    'utility_language_label' => '',
                    'utility_language_href' => '',
                    'utility_login_label' => '',
                    'utility_login_href' => '',
                    'utility_links' => [],
                ],
            ]
        );

        // ─── Section: site-footer (global) ───────────────────────
        Section::updateOrCreate(
            ['slug' => 'site-footer'],
            [
                'name' => 'Site footer',
                'version' => '1.0.0',
                'category' => 'layout',
                'icon' => 'LayoutPanelBottom',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['logo', 'tagline', 'contact_email', 'contact_phone', 'address', 'show_brand_strip', 'columns', 'socials', 'iban', 'bank_name', 'license_number', 'license_authority', 'regulatory_note', 'copyright'],
                    'properties' => [
                        'logo' => ['type' => 'string', 'title' => 'Logo', 'format' => 'image', 'nullable' => true],
                        'tagline' => ['type' => 'string', 'title' => 'Tagline', 'format' => 'textarea', 'maxLength' => 300],
                        'contact_email' => ['type' => 'string', 'title' => 'Contact email', 'maxLength' => 120],
                        'contact_phone' => ['type' => 'string', 'title' => 'Contact phone', 'maxLength' => 64],
                        'address' => ['type' => 'string', 'title' => 'Address', 'format' => 'textarea', 'maxLength' => 300, 'description' => 'Multi-line OK. Appears below contact info.'],
                        'show_brand_strip' => ['type' => 'boolean', 'title' => 'Show brand colour strip at top'],
                        'columns' => [
                            'type' => 'array',
                            'title' => 'Link columns',
                            'maxItems' => 4,
                            'addLabel' => 'Add column',
                            'itemLabel' => 'Column {index}: {heading}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['heading', 'links'],
                                'properties' => [
                                    'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 64],
                                    'links' => [
                                        'type' => 'array',
                                        'title' => 'Links',
                                        'maxItems' => 10,
                                        'addLabel' => 'Add link',
                                        'itemLabel' => 'Link {index}: {label}',
                                        'items' => [
                                            'type' => 'object',
                                            'fieldOrder' => ['label', 'href'],
                                            'properties' => [
                                                'label' => ['type' => 'string', 'title' => 'Label', 'maxLength' => 64],
                                                'href' => ['type' => 'string', 'title' => 'URL', 'format' => 'url', 'maxLength' => 255],
                                            ],
                                            'required' => ['label', 'href'],
                                        ],
                                    ],
                                ],
                                'required' => ['heading'],
                            ],
                        ],
                        'socials' => [
                            'type' => 'array',
                            'title' => 'Social links',
                            'maxItems' => 8,
                            'addLabel' => 'Add social',
                            'itemLabel' => 'Social {index}: {platform}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['platform', 'href'],
                                'properties' => [
                                    'platform' => [
                                        'type' => 'string', 'title' => 'Platform',
                                        'enum' => ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'email'],
                                        'enumLabels' => [
                                            'facebook' => 'Facebook',
                                            'instagram' => 'Instagram',
                                            'twitter' => 'Twitter / X',
                                            'youtube' => 'YouTube',
                                            'linkedin' => 'LinkedIn',
                                            'email' => 'Email',
                                        ],
                                    ],
                                    'href' => ['type' => 'string', 'title' => 'URL', 'format' => 'url', 'maxLength' => 255],
                                ],
                                'required' => ['platform', 'href'],
                            ],
                        ],
                        // ─── Trust strip (welfare-site convention) ───
                        'iban' => ['type' => 'string', 'title' => 'Bank IBAN', 'maxLength' => 48, 'placeholder' => 'SA00 0000 0000 0000 0000 0000', 'description' => 'Shown in the trust strip above copyright.'],
                        'bank_name' => ['type' => 'string', 'title' => 'Bank name', 'maxLength' => 80, 'placeholder' => 'Bank IBAN'],
                        'license_number' => ['type' => 'string', 'title' => 'License / registration number', 'maxLength' => 80],
                        'license_authority' => ['type' => 'string', 'title' => 'License authority label', 'maxLength' => 80, 'placeholder' => 'License'],
                        'regulatory_note' => ['type' => 'string', 'title' => 'Regulatory note', 'format' => 'textarea', 'maxLength' => 300, 'description' => 'Optional small print about compliance / audit.'],
                        'copyright' => ['type' => 'string', 'title' => 'Copyright line', 'maxLength' => 200, 'description' => 'Use {year} for the current year.'],
                    ],
                    'required' => [],
                ],
                'default_settings_json' => [
                    'logo' => null,
                    'tagline' => 'Building sustainable Islamic education through your support.',
                    'contact_email' => 'hello@example.org',
                    'contact_phone' => '',
                    'address' => '',
                    'show_brand_strip' => true,
                    'iban' => '',
                    'bank_name' => '',
                    'license_number' => '',
                    'license_authority' => '',
                    'regulatory_note' => '',
                    'columns' => [
                        [
                            'heading' => 'About',
                            'links' => [
                                ['label' => 'Our mission', 'href' => '/about'],
                                ['label' => 'Team', 'href' => '/team'],
                                ['label' => 'Annual report', 'href' => '/report'],
                            ],
                        ],
                        [
                            'heading' => 'Programs',
                            'links' => [
                                ['label' => 'Orphan sponsorship', 'href' => '/sponsor'],
                                ['label' => 'Scholarships', 'href' => '/scholarships'],
                                ['label' => 'Emergency relief', 'href' => '/relief'],
                            ],
                        ],
                        [
                            'heading' => 'Get involved',
                            'links' => [
                                ['label' => 'Donate', 'href' => '/donate'],
                                ['label' => 'Volunteer', 'href' => '/volunteer'],
                                ['label' => 'Contact', 'href' => '/contact'],
                            ],
                        ],
                    ],
                    'socials' => [
                        ['platform' => 'facebook', 'href' => 'https://facebook.com/'],
                        ['platform' => 'instagram', 'href' => 'https://instagram.com/'],
                        ['platform' => 'youtube', 'href' => 'https://youtube.com/'],
                    ],
                    'copyright' => '© {year} Your Trust. All rights reserved.',
                ],
            ]
        );

        // ─── Section: section-divider (ornament between sections) ────────
        Section::updateOrCreate(
            ['slug' => 'section-divider'],
            [
                'name' => 'Section divider',
                'version' => '1.0.0',
                'category' => 'layout',
                'icon' => 'Minus',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['style', 'width', 'color'],
                    'properties' => [
                        'style' => [
                            'type' => 'string',
                            'title' => 'Style',
                            'enum' => ['ornament', 'dots', 'line'],
                            'enumLabels' => [
                                'ornament' => 'Ornamental star (welfare classic)',
                                'dots' => 'Three dots',
                                'line' => 'Plain hairline',
                            ],
                        ],
                        'width' => [
                            'type' => 'string',
                            'title' => 'Width',
                            'enum' => ['narrow', 'normal', 'wide', 'full'],
                            'enumLabels' => [
                                'narrow' => 'Narrow',
                                'normal' => 'Normal',
                                'wide' => 'Wide',
                                'full' => 'Full container',
                            ],
                        ],
                        'color' => ['type' => 'string', 'title' => 'Colour override', 'format' => 'color', 'description' => 'Leave empty to use the theme accent.'],
                    ],
                    'required' => [],
                ],
                'default_settings_json' => [
                    'style' => 'ornament',
                    'width' => 'normal',
                    'color' => '',
                ],
            ]
        );

        // ─── Section: service-pillars (4-col icon-led services) ──────────
        Section::updateOrCreate(
            ['slug' => 'service-pillars'],
            [
                'name' => 'Service pillars',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'Sparkles',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'subheading', 'columns', 'style', 'pillars'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'subheading' => ['type' => 'string', 'title' => 'Subheading', 'format' => 'textarea', 'maxLength' => 400],
                        'columns' => [
                            'type' => 'string',
                            'title' => 'Columns',
                            'enum' => ['2', '3', '4'],
                            'enumLabels' => ['2' => '2 columns', '3' => '3 columns', '4' => '4 columns'],
                        ],
                        'style' => [
                            'type' => 'string',
                            'title' => 'Card style',
                            'enum' => ['cards', 'minimal', 'boxed'],
                            'enumLabels' => [
                                'cards' => 'Cards (default)',
                                'minimal' => 'Minimal (no card)',
                                'boxed' => 'Boxed (brand-coloured)',
                            ],
                        ],
                        'pillars' => [
                            'type' => 'array',
                            'title' => 'Pillars',
                            'minItems' => 1,
                            'maxItems' => 8,
                            'addLabel' => 'Add pillar',
                            'itemLabel' => 'Pillar {index}: {title}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['icon', 'title', 'description', 'link_label', 'link_href'],
                                'properties' => [
                                    'icon' => [
                                        'type' => 'string',
                                        'title' => 'Icon',
                                        'enum' => ['Sparkles', 'Heart', 'HandHeart', 'Award', 'BookOpen', 'Users', 'Globe', 'Compass', 'Star', 'Calendar', 'GraduationCap', 'Home', 'Briefcase', 'HeartHandshake'],
                                    ],
                                    'title' => ['type' => 'string', 'title' => 'Title', 'maxLength' => 120],
                                    'description' => ['type' => 'string', 'title' => 'Description', 'format' => 'textarea', 'maxLength' => 400],
                                    'link_label' => ['type' => 'string', 'title' => 'Link label', 'maxLength' => 40],
                                    'link_href' => ['type' => 'string', 'title' => 'Link URL', 'format' => 'url', 'maxLength' => 255],
                                ],
                                'required' => ['title'],
                            ],
                        ],
                    ],
                    'required' => ['heading'],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'What we offer',
                    'heading' => 'Built around the people who need it most',
                    'subheading' => 'Focused services, transparent reporting, lived experience on the ground.',
                    'columns' => '4',
                    'style' => 'cards',
                    'pillars' => [
                        ['icon' => 'HandHeart', 'title' => 'Orphan care', 'description' => 'Monthly food, schooling and shelter for children in our trust.', 'link_label' => 'Learn more', 'link_href' => '#'],
                        ['icon' => 'GraduationCap', 'title' => 'Scholarships', 'description' => 'Full-tuition Quran and Islamic-sciences scholarships.', 'link_label' => 'Apply', 'link_href' => '#'],
                        ['icon' => 'Heart', 'title' => 'Emergency relief', 'description' => 'Rapid-response food, water and medical aid in crisis zones.', 'link_label' => 'Donate', 'link_href' => '#'],
                        ['icon' => 'Users', 'title' => 'Family sponsorship', 'description' => 'Monthly support for widowed mothers and their children.', 'link_label' => 'Sponsor', 'link_href' => '#'],
                    ],
                ],
            ]
        );

        // ─── Section: partners-strip (trust signal — logos row) ──────────
        Section::updateOrCreate(
            ['slug' => 'partners-strip'],
            [
                'name' => 'Partners strip',
                'version' => '1.0.0',
                'category' => 'content',
                'icon' => 'Handshake',
                'preview_url' => null,
                'is_active' => true,
                'schema_json' => [
                    'type' => 'object',
                    'fieldOrder' => ['eyebrow', 'heading', 'subheading', 'layout', 'columns', 'grayscale', 'partners'],
                    'properties' => [
                        'eyebrow' => ['type' => 'string', 'title' => 'Eyebrow', 'maxLength' => 80],
                        'heading' => ['type' => 'string', 'title' => 'Heading', 'maxLength' => 200],
                        'subheading' => ['type' => 'string', 'title' => 'Subheading', 'format' => 'textarea', 'maxLength' => 400],
                        'layout' => [
                            'type' => 'string',
                            'title' => 'Layout',
                            'enum' => ['grid', 'marquee'],
                            'enumLabels' => ['grid' => 'Static grid', 'marquee' => 'Marquee (auto-scroll)'],
                        ],
                        'columns' => [
                            'type' => 'string',
                            'title' => 'Columns (grid mode)',
                            'enum' => ['3', '4', '5', '6'],
                            'enumLabels' => ['3' => '3', '4' => '4', '5' => '5', '6' => '6'],
                        ],
                        'grayscale' => ['type' => 'boolean', 'title' => 'Desaturate logos (colour on hover)'],
                        'partners' => [
                            'type' => 'array',
                            'title' => 'Partners',
                            'minItems' => 1,
                            'maxItems' => 24,
                            'addLabel' => 'Add partner',
                            'itemLabel' => 'Partner {index}: {name}',
                            'items' => [
                                'type' => 'object',
                                'fieldOrder' => ['logo', 'name', 'href'],
                                'properties' => [
                                    'logo' => ['type' => 'string', 'title' => 'Logo', 'format' => 'image', 'nullable' => true],
                                    'name' => ['type' => 'string', 'title' => 'Name', 'maxLength' => 80],
                                    'href' => ['type' => 'string', 'title' => 'Link URL', 'format' => 'url', 'maxLength' => 255],
                                ],
                                'required' => ['name'],
                            ],
                        ],
                    ],
                    'required' => [],
                ],
                'default_settings_json' => [
                    'eyebrow' => 'Our partners',
                    'heading' => 'Trusted by',
                    'subheading' => '',
                    'layout' => 'grid',
                    'columns' => '5',
                    'grayscale' => true,
                    'partners' => [],
                ],
            ]
        );

        // ─── Theme: Starter (default, supports BOTH website types) ───────
        $starter = Theme::updateOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'version' => '1.0.0',
                'author' => 'JamiyaWeb',
                'preview_url' => null,
                'is_active' => true,
                'is_default' => true,
                'sort_order' => 1,
                'supported_types' => ['welfare', 'scholar'],
                'manifest_json' => [
                    'id' => 'starter',
                    'name' => 'Starter',
                    'version' => '1.0.0',
                    'engine' => '>=1.0.0 <2.0.0',
                    'supported_types' => ['welfare', 'scholar'],
                    'default_pages' => ['home'],
                ],
                'tokens_json' => self::defaultTokens(),
            ]
        );
        $starter->sections()->sync([
            $hero->id        => ['sort_order' => 1, 'is_required' => true],
            $featureGrid->id => ['sort_order' => 2, 'is_required' => false],
            $paragraph->id   => ['sort_order' => 3, 'is_required' => false],
            $ctaBand->id     => ['sort_order' => 4, 'is_required' => false],
        ]);

        // ─── Theme: Compassion (welfare-only, no longer default) ─────────
        $compassion = Theme::updateOrCreate(
            ['slug' => 'compassion'],
            [
                'name' => 'Compassion',
                'version' => '1.0.0',
                'author' => 'JamiyaWeb',
                'preview_url' => null,
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 10,
                'supported_types' => ['welfare'],
                'manifest_json' => [
                    'id' => 'compassion',
                    'name' => 'Compassion',
                    'version' => '1.0.0',
                    'engine' => '>=1.0.0 <2.0.0',
                    'supported_types' => ['welfare'],
                    'default_pages' => ['home'],
                ],
                'tokens_json' => self::defaultTokens(),
            ]
        );
        $compassion->sections()->sync([
            $hero->id            => ['sort_order' => 1,  'is_required' => true],
            $statsCounter->id    => ['sort_order' => 2,  'is_required' => false],
            $programsGrid->id    => ['sort_order' => 3,  'is_required' => false],
            $donationWidget->id  => ['sort_order' => 4,  'is_required' => false],
            $featureGrid->id     => ['sort_order' => 5,  'is_required' => false],
            $testimonials->id    => ['sort_order' => 6,  'is_required' => false],
            $paragraph->id       => ['sort_order' => 7,  'is_required' => false],
            $ctaBand->id         => ['sort_order' => 8,  'is_required' => false],
            $contactForm->id     => ['sort_order' => 9,  'is_required' => false],
        ]);
    }

    /** Shared default tokens reused across themes. */
    private static function defaultTokens(): array
    {
        return [
            'color.primary'    => ['type' => 'color', 'default' => '#20665c', 'label' => 'Primary'],
            'color.accent'     => ['type' => 'color', 'default' => '#c18f2c', 'label' => 'Accent'],
            'color.background' => ['type' => 'color', 'default' => '#fbfaf7', 'label' => 'Background'],
            'color.foreground' => ['type' => 'color', 'default' => '#0c1f1c', 'label' => 'Text'],
            'font.heading'     => ['type' => 'font',  'default' => 'geist',   'label' => 'Heading font'],
            'font.body'        => ['type' => 'font',  'default' => 'geist',   'label' => 'Body font'],
            'radius.card'      => ['type' => 'size',  'default' => '16px',    'label' => 'Card radius'],
        ];
    }

    /** Helper to keep the icon select definition DRY for feature-grid. */
    private static function iconProp(string $title, string $default): array
    {
        return [
            'type' => 'string',
            'title' => $title,
            'default' => $default,
            'enum' => [
                'Sparkles', 'Heart', 'Award', 'BookOpen', 'Users', 'Star',
                'Compass', 'HandHeart', 'Globe', 'Mail', 'Phone', 'Calendar',
            ],
        ];
    }
}
