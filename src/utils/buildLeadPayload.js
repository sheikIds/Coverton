import { PRODUCT_IDS, CATEGORY_IDS } from './constants';

export const buildLeadPayload = ({
    leadData,
    adultMembers = [],
    childMembers = [],
    adultCount = null,
    childCount = null,
    relationship = null,
    age = '',
    user
}) => {
    const preferred = (leadData.preferredInsuranceCompanies || []).map(c => ({
        id: c.id,
    }));

    console.log({leadData, adultMembers, adultCount, childMembers, childCount, relationship, age, user})

    const boiigt = {
        productId: leadData.product || 0,
        categoryId: leadData.category || 0,
        additionals: [],
        members: [],
    };

    if (leadData.product === PRODUCT_IDS.MOTOR) {
        boiigt.additionals = [
            { name: 'Vehicle Number', value: leadData.vehicleNumber || '' },
        ];
    }

    if (leadData.product === PRODUCT_IDS.HEALTH) {

        if (leadData.category === CATEGORY_IDS.INDIVIDUAL) {
            boiigt.additionals = [
                { name: 'No of Adults', value: String(1 ?? 0) },
            ];

            boiigt.members = [{
                relationship: relationship?.id || 'self',
                age: String(age),
            }]
        }

        if (leadData.category === CATEGORY_IDS.FLOATER) {
            boiigt.additionals = [
                { name: 'No of Adults', value: String(adultCount ?? 0) },
                { name: 'No of Child', value: String(childCount ?? 0) },
            ];

            boiigt.members = [...adultMembers, ...childMembers].map(m => ({
                relationship: m.relationship?.id || '',
                age: String(m.age || ''),
            }));
        }
    }

    return {
        type: user?.role || '',
        consultant: leadData.consultant || '',
        consultantId: leadData.consultantId || '',
        customer: leadData.customer || '',
        customerType: leadData.customerType || '',
        productId: leadData.product || '',
        categoryId: leadData.category || '',
        phoneno: leadData.phoneno || '',
        saidv: leadData.saidv || 0,
        premiumExpected: leadData.premiumExpected || 0,
        expectedExpenditure: leadData.expectedExpenditure || 0,
        directExpenditure: leadData.directExpenditure || 0,
        timeByWhen: leadData.timeByWhen || new Date().toISOString(),
        preferred,
        boiigt,
    };
};
