import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { CategoryOption } from './category-options-drop-down-model';

@Injectable({ providedIn: 'root' })
export class CategoryOptionsDropDownService {

    constructor() {}    

    getCategories(): CategoryOption[] {
        return [
            { name: 'Travel' },
            { name: 'Food' },
            { name: 'Stay' },
            { name: 'Miscellaneous' }
        ];
    }

}
