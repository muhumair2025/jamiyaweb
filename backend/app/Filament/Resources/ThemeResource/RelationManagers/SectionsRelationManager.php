<?php

namespace App\Filament\Resources\ThemeResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class SectionsRelationManager extends RelationManager
{
    protected static string $relationship = 'sections';

    protected static ?string $title = 'Sections in this theme';

    public function form(Form $form): Form
    {
        // Form used when attaching or editing the pivot row.
        return $form->schema([
            Forms\Components\TextInput::make('sort_order')
                ->required()
                ->numeric()
                ->default(0),
            Forms\Components\Toggle::make('is_required')
                ->default(false)
                ->helperText('Required sections auto-seed on website creation and can\'t be removed.'),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->defaultSort('theme_sections.sort_order')
            ->columns([
                Tables\Columns\TextColumn::make('slug')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('name')->weight('semibold'),
                Tables\Columns\TextColumn::make('category')->badge(),
                Tables\Columns\TextColumn::make('version')->badge(),
                Tables\Columns\TextColumn::make('pivot.sort_order')
                    ->label('Order')
                    ->sortable(),
                Tables\Columns\IconColumn::make('pivot.is_required')
                    ->label('Required')
                    ->boolean(),
            ])
            ->headerActions([
                Tables\Actions\AttachAction::make()
                    ->preloadRecordSelect()
                    ->form(fn (Tables\Actions\AttachAction $action): array => [
                        $action->getRecordSelect(),
                        Forms\Components\TextInput::make('sort_order')->numeric()->default(0)->required(),
                        Forms\Components\Toggle::make('is_required')->default(false),
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DetachAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DetachBulkAction::make(),
                ]),
            ]);
    }
}
