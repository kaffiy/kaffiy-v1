// ========================================
// KAFFIY DASHBOARD LOGIN KURULUMU
// Dashboard için kullanıcı oluşturma ve test
// ========================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivuhmjtnnhieguiblnbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dWhtanRubmhpZWd1aWJsbmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MzY4OTcsImV4cCI6MjA4NDMxMjg5N30.SDOsi9-uSVtGt7faeu7fSZsZTXzk4mHSA9R0ky9mSfg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDashboardLogin() {
    console.log('🚀 Setting up Kaffiy Dashboard login system...\n');

    try {
        // 1. Mevcut kullanıcıları kontrol et
        console.log('📋 Step 1: Checking existing users...');
        const { data: existingUsers, error: checkError } = await supabase
            .from('worker_tb')
            .select('email, name, role, company_id, is_active')
            .in(['gokceoguz27@gmail.com', 'developer@kaffiy.com', 'cafe@kaffiy.com'])
            .limit(10);

        if (checkError) {
            console.log('📋 No existing users found or RLS blocked');
        } else {
            console.log('✅ Existing users:', existingUsers);
        }

        // 2. Dashboard kullanıcıları oluştur
        console.log('\n👤 Step 2: Creating dashboard users...');
        
        const dashboardUsers = [
            {
                email: 'developer@kaffiy.com',
                name: 'Developer',
                surname: 'User',
                role: 'brand_admin',
                company_id: null
            },
            {
                email: 'cafe@kaffiy.com',
                name: 'Cafe',
                surname: 'Owner',
                role: 'brand_admin',
                company_id: null
            },
            {
                email: 'admin@kaffiy.com',
                name: 'Admin',
                surname: 'User',
                role: 'brand_admin',
                company_id: null
            }
        ];

        for (const user of dashboardUsers) {
            console.log(`📝 Creating user: ${user.email}`);
            
            const { data: result, error: userError } = await supabase
                .from('worker_tb')
                .upsert({
                    email: user.email,
                    name: user.name,
                    surname: user.surname,
                    role: user.role,
                    company_id: user.company_id,
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (userError) {
                console.error(`❌ Failed to create ${user.email}:`, userError);
            } else {
                console.log(`✅ Created/updated: ${user.email}`);
            }
        }

        // 3. Halic Kahve'yi kontrol et
        console.log('\n🏢 Step 3: Checking Halic Kahve company...');
        const { data: company, error: companyError } = await supabase
            .from('company_tb')
            .select('*')
            .eq('slug', 'halickahve')
            .single();

        if (companyError) {
            console.log('📋 Halic Kahve not found, creating...');
            
            const { data: newCompany, error: createCompanyError } = await supabase
                .from('company_tb')
                .insert({
                    name: 'Halic Kahve',
                    slug: 'halickahve',
                    description: 'Test kafesi - Dashboard için',
                    payment_tier: 'premium',
                    is_active: true
                })
                .select()
                .single();

            if (createCompanyError) {
                    console.error('❌ Failed to create company:', createCompanyError);
                } else {
                    console.log('✅ Created Halic Kahve:', newCompany);
                }
            } else {
                console.log('✅ Halic Kahve found:', company);
            }
        }

        // 4. Test kullanıcıyı Halic Kahve'ye bağla
        if (company) {
            console.log('\n🔗 Step 4: Connecting test user to Halic Kahve...');
            
            const { data: updatedWorker, error: updateError } = await supabase
                .from('worker_tb')
                .update({
                    company_id: company.id,
                    role: 'brand_admin'
                })
                .eq('email', 'admin@kaffiy.com')
                .select()
                .single();

            if (updateError) {
                console.log('📋 Test user not found, creating...');
                    
                    const { data: newWorker, error: createWorkerError } = await supabase
                        .from('worker_tb')
                        .insert({
                            email: 'admin@kaffiy.com',
                            name: 'Admin',
                            surname: 'User',
                            role: 'brand_admin',
                            company_id: company.id,
                            is_active: true
                        })
                        .select()
                        .single();

                    if (createWorkerError) {
                        console.error('❌ Failed to create test user:', createWorkerError);
                    } else {
                        console.log('✅ Created test user:', newWorker);
                    }
                } else {
                    console.log('✅ Connected test user to Halic Kahve:', updatedWorker);
                }
        }

        // 5. Son durum kontrolü
        console.log('\n🔍 Step 5: Final verification...');
        const { data: finalUsers, error: finalError } = await supabase
            .from('worker_tb')
            .select('email, name, role, company_id, is_active')
            .in(['gokceoguz27@gmail.com', 'developer@kaffiy.com', 'cafe@kaffiy.com', 'admin@kaffiy.com'])
            .limit(10);

        if (finalError) {
            console.error('❌ Final verification failed:', finalError);
        } else {
            console.log('✅ Dashboard users ready:');
            finalUsers.forEach(user => {
                console.log(`  📧 ${user.email} - ${user.name} ${user.surname} (${user.role})`);
            });
        }

        console.log('\n🎯 LOGIN INFORMATION:');
        console.log('📱 Dashboard: http://localhost:8080');
        console.log('🔐 Login Credentials:');
        console.log('  • Admin: gokceoguz27@gmail.com / 123');
        console.log('  • Developer: developer@kaffiy.com / 123');
        console.log('  • Cafe Owner: cafe@kaffiy.com / 123');
        console.log('  • Admin: admin@kaffiy.com / 123');
        console.log('\n✅ Expected: All users should be able to login and access dashboard');

    } catch (error) {
        console.error('❌ Setup error:', error);
    }
}

// Çalıştır
setup_dashboard_login()
    .then(() => {
        console.log('\n🎉 Dashboard login setup completed!');
        console.log('📱 Dashboard: http://localhost:8080');
        console.log('🔐 Login: gokceoguz27@gmail.com / 123');
    })
    .catch(console.error);
