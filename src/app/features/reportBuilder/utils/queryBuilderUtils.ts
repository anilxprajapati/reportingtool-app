import { RuleGroupType, RuleType, ValidationMap, RuleGroupTypeAny } from 'react-querybuilder';

export const queryValidator = (query: RuleGroupTypeAny): ValidationMap => {
    const validationMap: ValidationMap = {};

    const recurse = (q: RuleGroupTypeAny) => {
        for (const rule of q.rules) {
            // If rule is a string, it's a combinator when `showCombinatorsBetweenRules` is true. Skip it.
            if (typeof rule === 'string') {
                continue;
            }

            if ('rules' in rule) {
                recurse(rule);
            } else {
                const { id, operator, value } = rule as RuleType;
                if (id) {
                    // Rules with operators like 'isNull' or 'notNull' don't have a value input.
                    if (operator !== 'isNull' && operator !== 'notNull') {
                         // A value is considered empty if it's an empty string, null, or undefined.
                         // We explicitly allow boolean `false` and number `0`.
                         if (value === '' || value === null || typeof value === 'undefined') {
                            validationMap[id] = { valid: false, reasons: ['Value cannot be empty.'] };
                         }
                    }
                }
            }
        }
    };
    if (query) {
       recurse(query);
    }
    return validationMap;
};