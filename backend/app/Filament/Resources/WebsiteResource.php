<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WebsiteResource\Pages;
use App\Models\Website;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WebsiteResource extends Resource
{
    protected static ?string $model = Website::class;

    protected static ?string $navigationIcon = 'heroicon-o-globe-alt';

    protected static ?string $navigationGroup = 'Tenants';

    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Ownership')
                ->columns(2)
                ->schema([
                    Forms\Components\Select::make('user_id')
                        ->relationship('user', 'email')
                        ->required()
                        ->searchable()
                        ->preload(),
                    Forms\Components\Select::make('theme_id')
                        ->relationship('theme', 'name')
                        ->required()
                        ->searchable()
                        ->preload(),
                ]),

            Forms\Components\Section::make('Routing')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('subdomain')
                        ->required()
                        ->alphaDash()
                        ->unique(ignoreRecord: true)
                        ->maxLength(64)
                        ->helperText('Resolves at {subdomain}.jamiyaweb.com (and {subdomain}.localhost:3000 in dev).'),
                    Forms\Components\TextInput::make('custom_domain')
                        ->maxLength(255)
                        ->unique(ignoreRecord: true)
                        ->helperText('Optional. Verify DNS before enabling.'),
                ]),

            Forms\Components\Section::make('Identity')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('site_name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('tagline')->maxLength(255),
                    Forms\Components\TextInput::make('logo_path')->maxLength(255),
                    Forms\Components\TextInput::make('favicon_path')->maxLength(255),
                ]),

            Forms\Components\Section::make('Localisation')
                ->columns(2)
                ->schema([
                    Forms\Components\TagsInput::make('site_languages')
                        ->required()
                        ->suggestions(['en', 'ar'])
                        ->placeholder('en, ar'),
                    Forms\Components\Select::make('default_locale')
                        ->options(['en' => 'English', 'ar' => 'Arabic'])
                        ->default('en')
                        ->required(),
                ]),

            Forms\Components\Section::make('Theme tokens override')
                ->collapsible()
                ->collapsed()
                ->schema([
                    Forms\Components\Textarea::make('tokens_json')
                        ->rows(8)
                        ->json()
                        ->autosize()
                        ->helperText('Per-tenant overrides on top of the theme defaults.'),
                ]),

            Forms\Components\Section::make('Lifecycle')
                ->columns(2)
                ->schema([
                    Forms\Components\Select::make('status')
                        ->options(['draft' => 'Draft', 'published' => 'Published'])
                        ->default('draft')
                        ->required(),
                    Forms\Components\DateTimePicker::make('published_at'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('subdomain')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('site_name')->searchable()->weight('semibold'),
                Tables\Columns\TextColumn::make('user.email')->searchable()->label('Owner'),
                Tables\Columns\TextColumn::make('theme.name')->badge(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'published' => 'success',
                        'draft' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('custom_domain')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('published_at')->dateTime()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'published' => 'Published']),
                Tables\Filters\SelectFilter::make('theme')->relationship('theme', 'name'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWebsites::route('/'),
            'create' => Pages\CreateWebsite::route('/create'),
            'edit' => Pages\EditWebsite::route('/{record}/edit'),
        ];
    }
}
