<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ThemeResource\Pages;
use App\Filament\Resources\ThemeResource\RelationManagers\SectionsRelationManager;
use App\Models\Theme;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ThemeResource extends Resource
{
    protected static ?string $model = Theme::class;

    protected static ?string $navigationIcon = 'heroicon-o-swatch';

    protected static ?string $navigationGroup = 'Engine';

    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Identity')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('slug')
                        ->required()
                        ->alphaDash()
                        ->unique(ignoreRecord: true)
                        ->maxLength(64)
                        ->helperText('URL-safe identifier — matches React theme folder name.'),
                    Forms\Components\TextInput::make('name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('version')
                        ->required()
                        ->maxLength(32)
                        ->default('1.0.0')
                        ->helperText('Semver: 1.2.3'),
                    Forms\Components\TextInput::make('author')->maxLength(255),
                    Forms\Components\TextInput::make('preview_url')
                        ->url()
                        ->maxLength(255)
                        ->columnSpanFull(),
                ]),

            Forms\Components\Section::make('Lifecycle')
                ->columns(3)
                ->schema([
                    Forms\Components\Toggle::make('is_active')->default(true),
                    Forms\Components\Toggle::make('is_default')
                        ->helperText('Suggested as the default theme during onboarding.'),
                    Forms\Components\TextInput::make('sort_order')
                        ->required()
                        ->numeric()
                        ->default(0),
                ]),

            Forms\Components\Section::make('Targeting')
                ->schema([
                    Forms\Components\TagsInput::make('supported_types')
                        ->required()
                        ->placeholder('welfare, scholar')
                        ->suggestions(['welfare', 'scholar'])
                        ->helperText('Which onboarding website types can use this theme.'),
                ]),

            Forms\Components\Section::make('Manifest & Tokens')
                ->collapsible()
                ->schema([
                    Forms\Components\Textarea::make('manifest_json')
                        ->required()
                        ->rows(8)
                        ->json()
                        ->autosize()
                        ->helperText('Full theme manifest (id, version, engine constraint, default_pages, …).'),
                    Forms\Components\Textarea::make('tokens_json')
                        ->required()
                        ->rows(10)
                        ->json()
                        ->autosize()
                        ->helperText('Design tokens with defaults (color.*, font.*, radius.*).'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('sort_order')
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('slug')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('name')->searchable()->weight('semibold'),
                Tables\Columns\TextColumn::make('version')->badge(),
                Tables\Columns\TextColumn::make('supported_types')
                    ->badge()
                    ->formatStateUsing(fn ($state) => \is_array($state) ? \implode(', ', $state) : (string) $state),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\IconColumn::make('is_default')->boolean(),
                Tables\Columns\TextColumn::make('sort_order')->sortable(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active'),
                Tables\Filters\TernaryFilter::make('is_default'),
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

    public static function getRelations(): array
    {
        return [
            SectionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListThemes::route('/'),
            'create' => Pages\CreateTheme::route('/create'),
            'edit' => Pages\EditTheme::route('/{record}/edit'),
        ];
    }
}
