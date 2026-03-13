import Hospital from '../models/Hospital.js';

const seedHospitals = async () => {
    try {
        const count = await Hospital.countDocuments();
        if (count > 0) return;

        console.log('🌱 Seeding initial hospitals...');

        const hospitals = [
            { name: 'Apollo Hospitals', city: 'Chennai', state: 'Tamil Nadu', address: 'Greams Road', website: 'https://apollohospitals.com' },
            { name: 'AIIMS Delhi', city: 'New Delhi', state: 'Delhi', address: 'Ansari Nagar', website: 'https://aiims.edu' },
            { name: 'Fortis Healthcare', city: 'Gurgaon', state: 'Haryana', address: 'Sector 44', website: 'https://fortishealthcare.com' },
            { name: 'Max Super Speciality', city: 'Mumbai', state: 'Maharashtra', address: 'Saket', website: 'https://maxhealthcare.in' },
            { name: 'Narayana Health', city: 'Bengaluru', state: 'Karnataka', address: 'Whitefield', website: 'https://narayanahealth.org' },
            { name: 'Manipal Hospital', city: 'Bengaluru', state: 'Karnataka', address: 'Old Airport Road', website: 'https://manipalhospitals.com' }
        ];

        await Hospital.insertMany(hospitals);
        console.log('✅ Hospitals seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding hospitals:', error);
    }
};

export default seedHospitals;
