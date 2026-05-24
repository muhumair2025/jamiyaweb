<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SectionResource\Pages;
use App\Models\Section;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SectionResource extends Resource
{
    protected static ?string $model = Section::class;

    protected static ?string $navigationIcon = 'heroicon-o-puzzle-piece';

    protected static ?string $navigationGroup = 'Engine';

    protected static ?int $navigationSort = 20;

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
                        ->helperText('Matches the React component slug (e.g. hero-basic, donation).'),
                    Forms\Components\TextInput::make('name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('version')
                        ->required()
                        ->maxLength(32)
                        ->default('1.0.0'),
                    Forms\Components\Select::make('category')
                        ->options([
                            'hero' => 'Hero',
                            'content' => 'Content',
                            'donation' => 'Donation',
                            'scholar' => 'Scholar',
                            'class' => 'Class',
                            'fatwa' => 'Fatwa',
                            'media' => 'Media',
                            'footer' => 'Footer',
                            'nav' => 'Navigation',
                            'cta' => 'CTA',
                            'other' => 'Other',
                        ])
                        ->searchable(),
                    Forms\Components\TextInput::make('icon')
                        ->placeholder('Sparkles')
                        ->helperText('Lucide icon name (matches frontend import).'),
                    Forms\Components\TextInput::make('preview_url')->url()->maxLength(255),
                    Forms\Components\Toggle::make('is_active')->default(true),
                ]),

            Forms\Components\Section::make('Schema & defaults')
                ->collapsible()
                ->schema([
                    Forms\Components\Textarea::make('schema_json')
                        ->required()
                        ->rows(10)
                        ->json()
                        ->autosize()
                        ->helperText('JSON-Schema-like shape for the section settings.'),
                    Forms\Components\Textarea::make('default_settings_json')
                        ->required()
                        ->rows(8)
                        ->json()
                        ->autosize()
                        ->helperText('Sensible defaults filled into a new section instance.'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('category')
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('slug')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('name')->searchable()->weight('semibold'),
                Tables\Columns\TextColumn::make('category')->badge()->sortable(),
                Tables\Columns\TextColumn::make('version')->badge(),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category')
                    ->options(fn () => Section::query()->distinct()->pluck('category', 'category')->filter()->toArray()),
                Tables\Filters\TernaryFilter::make('is_active'),
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
            'index' => Pages\ListSections::route('/'),
            'create' => Pages\CreateSection::route('/create'),
            'edit' => Pages\EditSection::route('/{record}/edit'),
        ];
    }
}
