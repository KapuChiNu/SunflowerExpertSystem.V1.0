(() => {
  const root = document.documentElement;
  const body = document.body;

  // ----- Language (EN/KM) -----
  const I18N = {
    en: {
      brand_title: 'Sunflower Diagnosis',
      brand_sub: 'Expert System',
      nav_main: 'MAIN',
      nav_dashboard: 'Dashboard',
      nav_symptom_check: 'Symptom Check',
      nav_disease_library: 'Disease Library',
      nav_doctor: 'DOCTOR',
      nav_doctor_dashboard: 'Doctor Dashboard',
      nav_disease_center: 'Disease Center',
      nav_manage_symptoms: 'Manage Symptoms',
      nav_symptom_history: 'Symptom History',
      nav_feedback_inbox: 'Feedback Inbox',
      nav_admin: 'ADMIN',
      nav_admin_dashboard: 'Admin Dashboard',
      nav_manage_diseases: 'Manage Diseases',
      nav_users: 'Users',
      nav_roles: 'Roles',
      nav_account: 'ACCOUNT',
      nav_profile: 'Profile',
      nav_logout: 'Logout',
      topbar_kicker: 'Dashboard',
      topbar_title: 'Sunflower Diagnosis',
      search_placeholder: 'Search symptoms, reports, crops',
      new_symptom_check: 'New symptom check',
      toggle_theme: 'Toggle theme',
      footer_title: 'Sunflower Diagnosis',
      footer_sub: '© 2026 • Expert System',
      login: 'Login',
      register: 'Register',
    },
    km: {
      brand_title: 'ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      brand_sub: 'ប្រព័ន្ធជំនាញ',
      nav_main: 'ម៉ឺនុយមេ',
      nav_dashboard: 'ផ្ទាំងគ្រប់គ្រង',
      nav_symptom_check: 'ពិនិត្យរោគសញ្ញា',
      nav_disease_library: 'បណ្ណាល័យជំងឺ',
      nav_doctor: 'វេជ្ជបណ្ឌិត',
      nav_doctor_dashboard: 'ផ្ទាំងវេជ្ជបណ្ឌិត',
      nav_disease_center: 'មជ្ឈមណ្ឌលជំងឺ',
      nav_manage_symptoms: 'គ្រប់គ្រងរោគសញ្ញា',
      nav_symptom_history: 'ប្រវត្តិរោគសញ្ញា',
      nav_feedback_inbox: 'ប្រអប់មតិកែលម្អ',
      nav_admin: 'អ្នកគ្រប់គ្រង',
      nav_admin_dashboard: 'ផ្ទាំងអ្នកគ្រប់គ្រង',
      nav_manage_diseases: 'គ្រប់គ្រងជំងឺ',
      nav_users: 'អ្នកប្រើប្រាស់',
      nav_roles: 'តួនាទី',
      nav_account: 'គណនី',
      nav_profile: 'ប្រវត្តិរូប',
      nav_logout: 'ចាកចេញ',
      topbar_kicker: 'ផ្ទាំងគ្រប់គ្រង',
      topbar_title: 'ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      search_placeholder: 'ស្វែងរករោគសញ្ញា របាយការណ៍ ដំណាំ',
      new_symptom_check: 'ពិនិត្យរោគសញ្ញាថ្មី',
      toggle_theme: 'ប្តូររចនាប័ទ្ម',
      footer_title: 'ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      footer_sub: '© 2026 • ប្រព័ន្ធជំនាញ',
      login: 'ចូល',
      register: 'ចុះឈ្មោះ',
    },
  };

  const LOOSE_I18N = {
    km: {
      'Sunflower Diagnosis': 'ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      'Expert System': 'ប្រព័ន្ធជំនាញ',
      'Dashboard': 'ផ្ទាំងគ្រប់គ្រង',
      'Overview': 'ទិដ្ឋភាពទូទៅ',
      'Prevention Tips': 'គន្លឹះការពារ',
      'Prevention tips': 'គន្លឹះការពារ',
      'Diagnosis Overview': 'ទិដ្ឋភាពការវិនិច្ឆ័យ',
      'View latest report': 'មើលរបាយការណ៍ចុងក្រោយ',
      'Start new symptom check': 'ចាប់ផ្តើមពិនិត្យរោគសញ្ញាថ្មី',
      'Latest diagnosis': 'ការវិនិច្ឆ័យចុងក្រោយ',
      'No match yet': 'មិនទាន់មានលទ្ធផល',
      'No result': 'គ្មានលទ្ធផល',
      'Matched symptoms': 'រោគសញ្ញាដែលផ្គូផ្គង',
      'No matched symptoms yet': 'មិនទាន់មានរោគសញ្ញាផ្គូផ្គង',
      'Run symptom check': 'ដំណើរការពិនិត្យរោគសញ្ញា',
      'Run symptom checker again': 'ដំណើរការត្រួតពិនិត្យម្ដងទៀត',
      'Browse reports': 'រកមើលរបាយការណ៍',
      'Today’s checks': 'ការត្រួតពិនិត្យថ្ងៃនេះ',
      'Total checks': 'ការត្រួតពិនិត្យសរុប',
      'Disease reports': 'របាយការណ៍ជំងឺ',
      'Needs review': 'ត្រូវពិនិត្យឡើងវិញ',
      'No change vs last week': 'គ្មានការផ្លាស់ប្តូរពីសប្ដាហ៍មុន',
      'Saved to history': 'បានរក្សាទុកក្នុងប្រវត្តិ',
      'Available in library': 'មាននៅក្នុងបណ្ណាល័យ',
      'Reports missing symptoms': 'របាយការណ៍ខ្វះរោគសញ្ញា',
      'View full library': 'មើលបណ្ណាល័យទាំងមូល',
      'Read full report': 'អានរបាយការណ៍ពេញ',
      'Disease library': 'បណ្ណាល័យជំងឺ',
      'No checks yet': 'មិនទាន់មានការត្រួតពិនិត្យ',
      'No match': 'មិនផ្គូផ្គង',
      'No suggestions': 'មិនមានការណែនាំ',
      'Disease': 'ជំងឺ',
      'Symptom': 'រោគសញ្ញា',
      'Search results': 'លទ្ធផលស្វែងរក',
      'No results found': 'មិនមានលទ្ធផល',
      'Manage diseases': 'គ្រប់គ្រងជំងឺ',
      'Manage symptoms': 'គ្រប់គ្រងរោគសញ្ញា',
      'All symptoms': 'រោគសញ្ញាទាំងអស់',
      'Add symptom': 'បន្ថែមរោគសញ្ញា',
      'Symptom label': 'ស្លាករោគសញ្ញា',
      'Select disease': 'ជ្រើសរើសជំងឺ',
      'Type': 'ប្រភេទ',
      'Action': 'សកម្មភាព',
      'Edit': 'កែប្រែ',
      'Delete': 'លុប',
      'View': 'មើល',
      'Save': 'រក្សាទុក',
      'Cancel': 'បោះបង់',
      'Back': 'ត្រឡប់ក្រោយ',
      'Create role': 'បង្កើតតួនាទី',
      'Edit permission': 'កែសម្រួលសិទ្ធិ',
      'Save permissions': 'រក្សាទុកសិទ្ធិ',
      'Delete role': 'លុបតួនាទី',
      'No roles found.': 'មិនមានតួនាទី។',
      'Roles': 'តួនាទី',
      'Users': 'អ្នកប្រើប្រាស់',
      'My profile': 'ប្រវត្តិរូបរបស់ខ្ញុំ',
      'Update your username or password.': 'ធ្វើបច្ចុប្បន្នភាពឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់។',
      'Username': 'ឈ្មោះអ្នកប្រើ',
      'Password': 'ពាក្យសម្ងាត់',
      'Current password': 'ពាក្យសម្ងាត់បច្ចុប្បន្ន',
      'New password': 'ពាក្យសម្ងាត់ថ្មី',
      'Confirm new password': 'បញ្ជាក់ពាក្យសម្ងាត់ថ្មី',
      'Save changes': 'រក្សាទុកការផ្លាស់ប្តូរ',
      'Home': 'ទំព័រដើម',
      'Feedback': 'មតិកែលម្អ',
      'Open': 'បើក',
      'Resolved': 'បានដោះស្រាយ',
      'Login': 'ចូល',
      'Log in': 'ចូល',
      'Register': 'ចុះឈ្មោះ',
      'Language': 'ភាសា',
      'English': 'អង់គ្លេស',
      'Sunflower Diagnosis Center': 'មជ្ឈមណ្ឌលវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      'Monitor symptoms, run checks, and manage disease reports.': 'តាមដានរោគសញ្ញា ដំណើរការត្រួតពិនិត្យ និងគ្រប់គ្រងរបាយការណ៍ជំងឺ។',
      'My Profile • Sunflower Diagnosis': 'ប្រវត្តិរូប • ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      'Roles • Admin': 'តួនាទី • អ្នកគ្រប់គ្រង',
      'Admin Dashboard • Sunflower Diagnosis': 'ផ្ទាំងអ្នកគ្រប់គ្រង • ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      'Doctor Dashboard • Sunflower Diagnosis': 'ផ្ទាំងវេជ្ជបណ្ឌិត • ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      'Alternaria Leaf Spot': 'ជំងឺស្លឹក Alternaria',
      'Bacterial Head Rot': 'ជំងឺរលួយក្បាលដោយបាក់តេរី',
      'Charcoal Rot': 'ជំងឺរលួយធ្យូង',
      'Downy Mildew': 'ជំងឺរោគផ្សិតទន់',
      'Rust': 'ជំងឺច្រេះ',
      'White Mold': 'ជំងឺផ្សិតស',
      'Rhizopus Head Rot': 'ជំងឺរលួយក្បាល Rhizopus',
      'Sclerotinia Head Rot': 'ជំងឺរលួយក្បាល Sclerotinia',
      'Doctor dashboard': 'ផ្ទាំងវេជ្ជបណ្ឌិត',
      'Admin dashboard': 'ផ្ទាំងអ្នកគ្រប់គ្រង',
      'Doctor Dashboard': 'ផ្ទាំងវេជ្ជបណ្ឌិត',
      'Admin Dashboard': 'ផ្ទាំងអ្នកគ្រប់គ្រង',
      'Disease center': 'មជ្ឈមណ្ឌលជំងឺ',
      'Feedback inbox': 'ប្រអប់មតិកែលម្អ',
      'Back to dashboard': 'ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង',
      'Back to history': 'ត្រឡប់ទៅប្រវត្តិ',
      'Back to users': 'ត្រឡប់ទៅអ្នកប្រើប្រាស់',
      'Back to Diseases': 'ត្រឡប់ទៅបណ្ណាល័យជំងឺ',
      'Back to list': 'ត្រឡប់ទៅបញ្ជី',
      'Manage disease reports and review symptom checker activity.': 'គ្រប់គ្រងរបាយការណ៍ជំងឺ និងពិនិត្យសកម្មភាពត្រួតពិនិត្យរោគសញ្ញា។',
      'Track disease reports and keep the symptom library updated.': 'តាមដានរបាយការណ៍ជំងឺ និងធ្វើបច្ចុប្បន្នភាពបណ្ណាល័យរោគសញ្ញា។',
      'Doctors can add and update disease reports. Deleting is admin-only.': 'វេជ្ជបណ្ឌិតអាចបន្ថែម និងកែប្រែរបាយការណ៍ជំងឺ។ ការលុបសម្រាប់អ្នកគ្រប់គ្រងប៉ុណ្ណោះ។',
      'Admins can add, update, and delete disease reports.': 'អ្នកគ្រប់គ្រងអាចបន្ថែម កែប្រែ និងលុបរបាយការណ៍ជំងឺ។',
      'Quick stats': 'ស្ថិតិរហ័ស',
      'Diseases': 'ជំងឺ',
      'Open feedback': 'មតិកែលម្អបើក',
      'Recent symptom checks': 'ការត្រួតពិនិត្យថ្មីៗ',
      'View all': 'មើលទាំងអស់',
      'Details': 'ព័ត៌មានលម្អិត',
      'No symptom checker activity yet.': 'មិនទាន់មានសកម្មភាពត្រួតពិនិត្យរោគសញ្ញា។',
      'Tip: keep disease reports updated to improve diagnosis quality.': 'គន្លឹះ៖ ធ្វើបច្ចុប្បន្នភាពរបាយការណ៍ជំងឺ ដើម្បីបង្កើនគុណភាពវិនិច្ឆ័យ។',
      'Tip: add more details to each disease report (symptoms, cause, treatment, prevention).': 'គន្លឹះ៖ បន្ថែមព័ត៌មានលម្អិតទៅរបាយការណ៍នីមួយៗ (រោគសញ្ញា មូលហេតុ ការព្យាបាល ការការពារ)។',
      '+ Add disease': '+ បន្ថែមជំងឺ',
      'Add disease report': 'បន្ថែមរបាយការណ៍ជំងឺ',
      'Create a new sunflower disease report. Symptom checklist is managed on a separate page.': 'បង្កើតរបាយការណ៍ជំងឺផ្កាឈូករ័ត្នថ្មី។ បញ្ជីរោគសញ្ញាត្រូវបានគ្រប់គ្រងនៅទំព័រផ្សេង។',
      'Optional. If empty, placeholder image is used.': 'ជាជម្រើស។ បើទទេ នឹងប្រើរូបភាពលំនាំដើម។',
      'Add as ': 'បន្ថែមជា ',
      'Type: Symptom label': 'ប្រភេទ៖ ស្លាករោគសញ្ញា',
      ' (for example: ': ' (ឧទាហរណ៍៖ ',
      'Leaf: Yellow spots': 'ស្លឹក៖ ចំណុចពណ៌លឿង',
      'Leaf': 'ស្លឹក',
      'Leaf / Head': 'ស្លឹក / ក្បាលផ្កា',
      'Whole plant': 'រុក្ខជាតិទាំងមូល',
      'Stem': 'ដើម',
      'Head': 'ក្បាលផ្កា',
      'Root': 'ឫស',
      'Seed / Seedling': 'គ្រាប់ / កូនដំណាំ',
      'Environment': 'បរិស្ថាន',
      'General': 'ទូទៅ',
      '1. Leaf': '1. ស្លឹក',
      '2. Leaf / Head': '2. ស្លឹក / ក្បាលផ្កា',
      '3. Whole plant': '3. រុក្ខជាតិទាំងមូល',
      '4. Stem': '4. ដើម',
      '5. Head': '5. ក្បាលផ្កា',
      '6. Root': '6. ឫស',
      '7. Seed / Seedling': '7. គ្រាប់ / កូនដំណាំ',
      '8. Environment': '8. បរិស្ថាន',
      'Yellow spots on leaves': 'ចំណុចពណ៌លឿងលើស្លឹក',
      'Leaf and head discoloration': 'ស្លឹក និងក្បាលផ្កាប្រែពណ៌',
      'Whole plant wilting': 'រុក្ខជាតិទាំងមូលស្រពោន',
      'Stem lesions': 'ដំបៅលើដើម',
      'Rotting flower head': 'ក្បាលផ្ការលួយ',
      'Root rot': 'ឫសរលួយ',
      'Poor germination': 'ដំណុះមិនល្អ',
      'High humidity': 'សំណើមខ្ពស់',
      'Disease details': 'ព័ត៌មានជំងឺ',
      'Symptoms list': 'បញ្ជីរោគសញ្ញា',
      '8 symptom type buttons': 'ប៊ូតុងប្រភេទរោគសញ្ញា 8',
      'All symptoms are shown in one list below, divided into 8 types.': 'រោគសញ្ញាទាំងអស់ត្រូវបានបង្ហាញក្នុងបញ្ជីខាងក្រោម បែងចែកជា 8 ប្រភេទ។',
      'Selected type:': 'ប្រភេទដែលបានជ្រើស៖',
      'Press Enter to add. Use Edit/Delete in the list to update items.': 'ចុច Enter ដើម្បីបន្ថែម។ ប្រើ កែប្រែ/លុប ក្នុងបញ្ជីដើម្បីធ្វើបច្ចុប្បន្នភាពធាតុ។',
      'Total items:': 'ចំនួនសរុប៖',
      'No symptom items yet.': 'មិនទាន់មានធាតុរោគសញ្ញា។',
      'No items in this type.': 'មិនមានធាតុនៅក្នុងប្រភេទនេះ។',
      'Cancel edit': 'បោះបង់ការកែប្រែ',
      'Update symptom item': 'កែប្រែធាតុរោគសញ្ញា',
      'Update': 'កែប្រែ',
      'Add': 'បន្ថែម',
      'Manage Symptoms • Admin': 'គ្រប់គ្រងរោគសញ្ញា • អ្នកគ្រប់គ្រង',
      'Manage Symptoms • Doctor': 'គ្រប់គ្រងរោគសញ្ញា • វេជ្ជបណ្ឌិត',
      'All Symptoms • Admin': 'រោគសញ្ញាទាំងអស់ • អ្នកគ្រប់គ្រង',
      'All Symptoms • Doctor': 'រោគសញ្ញាទាំងអស់ • វេជ្ជបណ្ឌិត',
      'Symptom Center • Admin': 'មជ្ឈមណ្ឌលរោគសញ្ញា • អ្នកគ្រប់គ្រង',
      'Symptom Center • Doctor': 'មជ្ឈមណ្ឌលរោគសញ្ញា • វេជ្ជបណ្ឌិត',
      'All symptoms': 'រោគសញ្ញាទាំងអស់',
      'Complete symptom list from all diseases in the system.': 'បញ្ជីរោគសញ្ញាពេញលេញពីជំងឺទាំងអស់ក្នុងប្រព័ន្ធ។',
      'New symptom will be added to the selected disease.': 'រោគសញ្ញាថ្មីនឹងត្រូវបានបន្ថែមទៅជំងឺដែលបានជ្រើស។',
      'Total unique symptoms:': 'ចំនួនរោគសញ្ញាមិនស្ទួនសរុប៖',
      'Used in': 'ប្រើក្នុង',
      'Diseases': 'ជំងឺ',
      'No symptoms available yet.': 'មិនទាន់មានរោគសញ្ញា។',
      'Select symptoms': 'ជ្រើសរោគសញ្ញា',
      'Select all symptoms you observe, then click ': 'ជ្រើសរោគសញ្ញាទាំងអស់ដែលអ្នកសង្កេតឃើញ បន្ទាប់មកចុច ',
      'Check Symptoms': 'ពិនិត្យរោគសញ្ញា',
      ' to view the most likely disease report.': ' ដើម្បីមើលរបាយការណ៍ជំងឺដែលទំនងបំផុត។',
      'Search symptoms (example: wilting, stem, root rot)': 'ស្វែងរករោគសញ្ញា (ឧទាហរណ៍៖ ស្រពោន ដើម រលួយឫស)',
      'Selected only': 'តែអ្វីដែលបានជ្រើស',
      'Clear filters': 'សម្អាតតម្រង',
      'selected': 'បានជ្រើស',
      'visible': 'មើលឃើញ',
      'All categories': 'គ្រប់ប្រភេទ',
      'No symptoms found': 'រកមិនឃើញរោគសញ្ញា',
      'Try a different keyword or clear filters.': 'សាកពាក្យគន្លឹះផ្សេង ឬសម្អាតតម្រង។',
      'Reset': 'កំណត់ឡើងវិញ',
      'If no disease match is found, we will ask you to report unmatched symptoms with a photo.': 'បើរកមិនឃើញជំងឺដែលផ្គូផ្គង យើងនឹងស្នើឱ្យអ្នករាយការណ៍រោគសញ្ញាដែលមិនផ្គូផ្គងជាមួយរូបថត។',
      'Search': 'ស្វែងរក',
      'Results': 'លទ្ធផល',
      'Showing matches for "': 'កំពុងបង្ហាញលទ្ធផលសម្រាប់ "',
      'Type a search': 'បញ្ចូលពាក្យស្វែងរក',
      'Search diseases or symptoms to see results.': 'ស្វែងរកជំងឺ ឬរោគសញ្ញា ដើម្បីមើលលទ្ធផល។',
      'result(s)': 'លទ្ធផល',
      'No disease matches': 'មិនមានលទ្ធផលជំងឺ',
      'Try a different keyword.': 'សាកពាក្យគន្លឹះផ្សេង។',
      'Symptom matches': 'រោគសញ្ញាផ្គូផ្គង',
      'match(es)': 'ការផ្គូផ្គង',
      'No symptom matches': 'មិនមានរោគសញ្ញាផ្គូផ្គង',
      'Try another keyword.': 'សាកពាក្យគន្លឹះផ្សេងទៀត។',
      'Report': 'របាយការណ៍',
      'Open report': 'បើករបាយការណ៍',
      'View details →': 'មើលព័ត៌មានលម្អិត →',
      'Plant pathology • Sunflower diseases': 'រោគវិទ្យារុក្ខជាតិ • ជំងឺផ្កាឈូករ័ត្ន',
      'Browse disease reports, or create an account to use the symptom checker.': 'រកមើលរបាយការណ៍ជំងឺ ឬបង្កើតគណនីដើម្បីប្រើការត្រួតពិនិត្យរោគសញ្ញា។',
      'Condition': 'សភាពជំងឺ',
      'A practical summary to help you diagnose and respond.': 'សេចក្តីសង្ខេបជាក់ស្តែង ដើម្បីជួយអ្នកវិនិច្ឆ័យ និងឆ្លើយតប។',
      'Symptoms': 'រោគសញ្ញា',
      'Cause': 'មូលហេតុ',
      'Treatment': 'ការព្យាបាល',
      'Prevention': 'ការការពារ',
      'Explore other diseases': 'ស្វែងរកជំងឺផ្សេងទៀត',
      'Print report': 'បោះពុម្ពរបាយការណ៍',
      'Symptom Checker Result': 'លទ្ធផលពិនិត្យរោគសញ្ញា',
      'Based on the symptoms you selected, the system suggests ': 'ផ្អែកលើរោគសញ្ញាដែលអ្នកបានជ្រើស ប្រព័ន្ធណែនាំ ',
      'Symptoms you selected': 'រោគសញ្ញាដែលអ្នកបានជ្រើស',
      'Why this disease?': 'ហេតុអ្វីជាជំងឺនេះ?',
      'Other possible matches': 'លទ្ធផលផ្សេងដែលអាចផ្គូផ្គង',
      'weight': 'ទម្ងន់',
      'match': 'ផ្គូផ្គង',
      'Feedback • Sunflower Diagnosis': 'មតិកែលម្អ • ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      'Feedback Inbox • Admin': 'ប្រអប់មតិកែលម្អ • អ្នកគ្រប់គ្រង',
      'Feedback Inbox • Doctor': 'ប្រអប់មតិកែលម្អ • វេជ្ជបណ្ឌិត',
      'No-Match Report': 'របាយការណ៍មិនផ្គូផ្គង',
      'Tell us what symptom is missing': 'ប្រាប់យើងពីរោគសញ្ញាដែលខ្វះ',
      'Your report helps doctors update symptom rules in the system.': 'របាយការណ៍របស់អ្នកជួយវេជ្ជបណ្ឌិតធ្វើបច្ចុប្បន្នភាពច្បាប់រោគសញ្ញាក្នុងប្រព័ន្ធ។',
      'No disease match found': 'រកមិនឃើញជំងឺដែលផ្គូផ្គង',
      'Please describe observed symptoms and attach at least one photo.': 'សូមពិពណ៌នារោគសញ្ញាដែលបានសង្កេត និងភ្ជាប់រូបថតយ៉ាងតិចមួយ។',
      'Linked symptom check #': 'ភ្ជាប់ការពិនិត្យរោគសញ្ញា #',
      'Submitted on ': 'បានដាក់ស្នើនៅ ',
      'No disease match was found. Photo evidence is required for this report.': 'រកមិនឃើញជំងឺដែលផ្គូផ្គង។ ត្រូវការរូបថតសម្រាប់របាយការណ៍នេះ។',
      'This report will be linked to your symptom check history.': 'របាយការណ៍នេះនឹងត្រូវបានភ្ជាប់ទៅប្រវត្តិពិនិត្យរោគសញ្ញារបស់អ្នក។',
      'Short subject': 'ប្រធានបទខ្លី',
      'Example: I selected leaf wilting and stem cracking, but the plant also has black spots around head and no matching disease appeared.': 'ឧទាហរណ៍៖ ខ្ញុំបានជ្រើសរោគសញ្ញាស្លឹកស្រពោន និងដើមប្រេះ ប៉ុន្តែមានចំណុចខ្មៅនៅក្បាលផ្កា ហើយមិនមានជំងឺផ្គូផ្គង។',
      'At least one photo is required for no-match symptom feedback.': 'ត្រូវការយ៉ាងតិចរូបថតមួយសម្រាប់មតិកែលម្អមិនផ្គូផ្គង។',
      'Optional. Upload a photo if it helps explain the issue.': 'ជាជម្រើស។ ផ្ទុកឡើងរូបថត ប្រសិនបើវាជួយពន្យល់បញ្ហា។',
      'Send no-match report': 'ផ្ញើរបាយការណ៍មិនផ្គូផ្គង',
      'Review feedback sent by users.': 'ពិនិត្យមតិកែលម្អដែលបានផ្ញើដោយអ្នកប្រើ។',
      'Review user feedback linked to symptom checks.': 'ពិនិត្យមតិយោបល់អ្នកប្រើដែលភ្ជាប់នឹងការពិនិត្យរោគសញ្ញា។',
      'Subject': 'ប្រធានបទ',
      'Message': 'សារ',
      'Symptom check': 'ការពិនិត្យរោគសញ្ញា',
      'Photo evidence': 'រូបថតភស្តុតាង',
      'Status': 'ស្ថានភាព',
      'Sent': 'បានផ្ញើ',
      'View photo': 'មើលរូបថត',
      'Resolve': 'ដោះស្រាយ',
      'No feedback yet': 'មិនទាន់មានមតិកែលម្អ',
      'User feedback will show up here.': 'មតិកែលម្អរបស់អ្នកប្រើនឹងបង្ហាញនៅទីនេះ។',
      'Symptom Checks • Admin': 'ប្រវត្តិរោគសញ្ញា • អ្នកគ្រប់គ្រង',
      'Symptom Checks • Doctor': 'ប្រវត្តិរោគសញ្ញា • វេជ្ជបណ្ឌិត',
      'Symptom checker history': 'ប្រវត្តិពិនិត្យរោគសញ្ញា',
      'Recent symptom checker submissions (logged automatically).': 'កំណត់ត្រាពិនិត្យរោគសញ្ញាថ្មីៗ (កត់ត្រាដោយស្វ័យប្រវត្តិ)។',
      'Time': 'ពេលវេលា',
      'User': 'អ្នកប្រើ',
      'Selected symptoms': 'រោគសញ្ញាដែលបានជ្រើស',
      'Top match': 'លទ្ធផលកំពូល',
      'Actions': 'សកម្មភាព',
      'No symptom checker activity yet.': 'មិនទាន់មានសកម្មភាពពិនិត្យរោគសញ្ញា។',
      'Symptom Check • Admin': 'ការពិនិត្យរោគសញ្ញា • អ្នកគ្រប់គ្រង',
      'Symptom Check • Doctor': 'ការពិនិត្យរោគសញ្ញា • វេជ្ជបណ្ឌិត',
      'By ': 'ដោយ ',
      'Diagnosis results': 'លទ្ធផលវិនិច្ឆ័យ',
      'Key: ': 'កូដ៖ ',
      'Score: ': 'ពិន្ទុ៖ ',
      'Open report': 'បើករបាយការណ៍',
      'Edit report': 'កែប្រែរបាយការណ៍',
      'Matched symptoms:': 'រោគសញ្ញាផ្គូផ្គង៖',
      'No matched symptoms saved.': 'មិនមានរោគសញ្ញាផ្គូផ្គងដែលបានរក្សាទុក។',
      'No results saved.': 'មិនមានលទ្ធផលដែលបានរក្សាទុក។',
      'No symptoms recorded.': 'មិនមានរោគសញ្ញាដែលបានកត់ត្រា។',
      'Users • Admin': 'អ្នកប្រើប្រាស់ • អ្នកគ្រប់គ្រង',
      'View, change roles, or delete user accounts.': 'មើល ផ្លាស់ប្តូរតួនាទី ឬលុបគណនីអ្នកប្រើ។',
      'ID': 'លេខសម្គាល់',
      'Email': 'អ៊ីមែល',
      'Role': 'តួនាទី',
      'Created': 'បង្កើត',
      'Last report': 'របាយការណ៍ចុងក្រោយ',
      'No report yet': 'មិនទាន់មានរបាយការណ៍',
      'View report': 'មើលរបាយការណ៍',
      'Change role': 'ផ្លាស់ប្តូរតួនាទី',
      'Clear history': 'សម្អាតប្រវត្តិ',
      'Tip: you cannot delete your own account while logged in.': 'គន្លឹះ៖ អ្នកមិនអាចលុបគណនីខ្លួនឯងពេលកំពុងចូលប្រើបានទេ។',
      'No users found.': 'មិនមានអ្នកប្រើប្រាស់។',
      'Change Role • Admin': 'ផ្លាស់ប្តូរតួនាទី • អ្នកគ្រប់គ្រង',
      'Change user role': 'ផ្លាស់ប្តូរតួនាទីអ្នកប្រើ',
      'Update role assignment for ': 'ធ្វើបច្ចុប្បន្នភាពតួនាទីសម្រាប់ ',
      'Admins can change roles only.': 'មានតែអ្នកគ្រប់គ្រងប៉ុណ្ណោះដែលអាចផ្លាស់ប្តូរតួនាទីបាន។',
      'Save role': 'រក្សាទុកតួនាទី',
      'Roles • Admin': 'តួនាទី • អ្នកគ្រប់គ្រង',
      'Use tabs to create roles or edit permissions.': 'ប្រើផ្ទាំងដើម្បីបង្កើតតួនាទី ឬកែសម្រួលសិទ្ធិ។',
      'Role name': 'ឈ្មោះតួនាទី',
      'Description': 'ការពិពណ៌នា',
      'Permissions': 'សិទ្ធិ',
      'Lowercase letters, numbers, dashes, or underscores only.': 'ប្រើតែអក្សរតូច លេខ សញ្ញា - ឬ _ ប៉ុណ្ណោះ។',
      'Optional description': 'ការពិពណ៌នាជាជម្រើស',
      'No roles found.': 'មិនមានតួនាទី។',
      'Login • Sunflower Diagnosis': 'ចូល • ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      'Register • Sunflower Diagnosis': 'ចុះឈ្មោះ • ការវិនិច្ឆ័យផ្កាឈូករ័ត្ន',
      'Create a user account': 'បង្កើតគណនីអ្នកប្រើ',
      'Username or Email': 'ឈ្មោះអ្នកប្រើ ឬអ៊ីមែល',
      'username or email': 'ឈ្មោះអ្នកប្រើ ឬអ៊ីមែល',
      'password': 'ពាក្យសម្ងាត់',
      'No account? ': 'មិនទាន់មានគណនី? ',
      'Already have an account? ': 'មានគណនីរួចហើយ? ',
      'Create account': 'បង្កើតគណនី',
      'your username': 'ឈ្មោះអ្នកប្រើរបស់អ្នក',
      'you@example.com': 'អ្នក@example.com',
      'min 6 characters': 'យ៉ាងតិច 6 តួអក្សរ',
      'repeat password': 'បញ្ចូលពាក្យសម្ងាត់ម្ដងទៀត',
      'Confirm Password': 'បញ្ជាក់ពាក្យសម្ងាត់',
      'Your username': 'ឈ្មោះអ្នកប្រើរបស់អ្នក',
      'Enter current password': 'បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន',
      'Repeat new password': 'បញ្ចូលពាក្យសម្ងាត់ថ្មីម្ដងទៀត',
      'Required if you change username or password.': 'ត្រូវការ ប្រសិនបើអ្នកប្តូរឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់។',
      'Current password (required to change username or password)': 'ពាក្យសម្ងាត់បច្ចុប្បន្ន (ត្រូវការសម្រាប់ប្តូរឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់)',
      'Name': 'ឈ្មោះ',
      'Replace image (PNG/JPG/WEBP)': 'ជំនួសរូបភាព (PNG/JPG/WEBP)',
      'Create disease': 'បង្កើតជំងឺ',
      'Save symptom items': 'រក្សាទុកធាតុរោគសញ្ញា',
      'Current: ': 'បច្ចុប្បន្ន៖ ',
      'None': 'គ្មាន',
      'Manage Diseases • Admin': 'គ្រប់គ្រងជំងឺ • អ្នកគ្រប់គ្រង',
      'Disease Center • Doctor': 'មជ្ឈមណ្ឌលជំងឺ • វេជ្ជបណ្ឌិត',
      'Edit disease': 'កែប្រែជំងឺ',
      'Delete disease': 'លុបជំងឺ',
      'Created by:': 'បង្កើតដោយ៖',
      'Last updated by:': 'កែប្រែចុងក្រោយដោយ៖',
      'Unknown': 'មិនស្គាល់',
      'Symptom checklist items:': 'ធាតុបញ្ជីរោគសញ្ញា៖',
      'slug:': 'ស្លាក៖',
      'Ready': 'រួចរាល់',
      'Missing': 'ខ្វះ',
      'Items': 'ធាតុ',
      'Symptoms list': 'បញ្ជីរោគសញ្ញា',
      'No diseases available yet.': 'មិនទាន់មានជំងឺ។',
      'Edit symptoms': 'កែប្រែរោគសញ្ញា',
      'Add symptoms': 'បន្ថែមរោគសញ្ញា',
      'disease': 'ជំងឺ',
      'diseases': 'ជំងឺ',
      'more': 'បន្ថែម',
      'No strong match found for the selected symptoms. Try selecting additional symptoms (or remove uncertain ones).': 'មិនមានការផ្គូផ្គងខ្លាំងសម្រាប់រោគសញ្ញាដែលបានជ្រើស។ សូមជ្រើសរោគសញ្ញាបន្ថែម (ឬដកអ្វីដែលមិនប្រាកដ)។',
      'Feedback submission is disabled for doctor/admin accounts.': 'គណនីវេជ្ជបណ្ឌិត/អ្នកគ្រប់គ្រង មិនអាចផ្ញើមតិកែលម្អបានទេ។',
      'Doctor and admin accounts cannot submit feedback.': 'គណនីវេជ្ជបណ្ឌិត និងអ្នកគ្រប់គ្រង មិនអាចផ្ញើមតិកែលម្អបានទេ។',
      'Feedback is only available when no symptom match is found.': 'មតិកែលម្អអាចប្រើបានតែពេលមិនមានការផ្គូផ្គងរោគសញ្ញាប៉ុណ្ណោះ។',
      'Invalid no-match symptom check.': 'ការពិនិត្យរោគសញ្ញាមិនផ្គូផ្គង មិនត្រឹមត្រូវ។',
      'Linked symptom check is invalid for no-match feedback.': 'ការពិនិត្យរោគសញ្ញាដែលភ្ជាប់ មិនត្រឹមត្រូវសម្រាប់មតិកែលម្អមិនផ្គូផ្គង។',
      'Photo must be PNG/JPG/WEBP.': 'រូបថតត្រូវជា PNG/JPG/WEBP។',
      'Please upload at least one photo for no-match symptom feedback.': 'សូមផ្ទុកឡើងយ៉ាងតិចរូបថតមួយសម្រាប់មតិកែលម្អមិនផ្គូផ្គង។',
      'Report sent. Thank you for helping improve symptom matching.': 'បានផ្ញើរបាយការណ៍។ សូមអរគុណសម្រាប់ការជួយកែលម្អការផ្គូផ្គងរោគសញ្ញា។',
      'Security token missing/expired. Please try again.': 'Token សុវត្ថិភាពបាត់ ឬផុតកំណត់។ សូមព្យាយាមម្ដងទៀត។',
      'Choose a disease before adding a symptom.': 'សូមជ្រើសជំងឺមុនបន្ថែមរោគសញ្ញា។',
      'Symptom name is required.': 'ត្រូវបញ្ចូលឈ្មោះរោគសញ្ញា។',
      'This symptom already exists for the selected disease.': 'រោគសញ្ញានេះមានរួចហើយសម្រាប់ជំងឺដែលបានជ្រើស។',
      'Original symptom data is missing.': 'ទិន្នន័យរោគសញ្ញាដើមបាត់។',
      'Updated symptom name is required.': 'ត្រូវបញ្ចូលឈ្មោះរោគសញ្ញាដែលបានកែប្រែ។',
      'No matching symptom found to edit.': 'មិនរកឃើញរោគសញ្ញាដែលផ្គូផ្គងសម្រាប់កែប្រែ។',
      'Symptom data is missing.': 'ទិន្នន័យរោគសញ្ញាបាត់។',
      'No matching symptom found to delete.': 'មិនរកឃើញរោគសញ្ញាដែលផ្គូផ្គងសម្រាប់លុប។',
      'Choose a disease from the Manage Symptoms list.': 'សូមជ្រើសជំងឺពីបញ្ជីគ្រប់គ្រងរោគសញ្ញា។',
      'Symptom checklist updated.': 'បានធ្វើបច្ចុប្បន្នភាពបញ្ជីរោគសញ្ញា។',
      'Feedback marked as resolved.': 'បានសម្គាល់មតិកែលម្អថាបានដោះស្រាយ។',
      'Disease created. Now add symptom checklist items.': 'បានបង្កើតជំងឺ។ សូមបន្ថែមធាតុបញ្ជីរោគសញ្ញា។',
      'Disease updated.': 'បានកែប្រែជំងឺ។',
      'Disease deleted.': 'បានលុបជំងឺ។',
      'Current password is required to change username or password.': 'ត្រូវការពាក្យសម្ងាត់បច្ចុប្បន្ន សម្រាប់ប្តូរឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់។',
      'Current password is incorrect.': 'ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវ។',
      'Username already taken.': 'ឈ្មោះអ្នកប្រើត្រូវបានប្រើរួច។',
      'Profile updated.': 'បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប។',
      'Email already registered.': 'អ៊ីមែលនេះបានចុះឈ្មោះរួច។',
      'Account created. You can log in now.': 'បានបង្កើតគណនី។ ឥឡូវអ្នកអាចចូលបាន។',
      'Invalid credentials.': 'ព័ត៌មានចូលមិនត្រឹមត្រូវ។',
      'Welcome back!': 'ស្វាគមន៍ត្រឡប់មកវិញ!',
      'You are logged out.': 'អ្នកបានចាកចេញ។',
      'You cannot change your own role while logged in.': 'អ្នកមិនអាចផ្លាស់ប្តូរតួនាទីខ្លួនឯងពេលកំពុងចូលប្រើបានទេ។',
      'User role updated.': 'បានធ្វើបច្ចុប្បន្នភាពតួនាទីអ្នកប្រើ។',
      'Role name already exists.': 'ឈ្មោះតួនាទីមានរួចហើយ។',
      'Role created.': 'បានបង្កើតតួនាទី។',
      'Role created. Now assign permissions.': 'បានបង្កើតតួនាទី។ ឥឡូវសូមកំណត់សិទ្ធិ។',
      'Role permissions updated.': 'បានធ្វើបច្ចុប្បន្នភាពសិទ្ធិតួនាទី។',
      'Admin role cannot be deleted.': 'មិនអាចលុបតួនាទី Admin បានទេ។',
      'This role is assigned to users and cannot be deleted.': 'តួនាទីនេះត្រូវបានផ្ដល់ឱ្យអ្នកប្រើ ហើយមិនអាចលុបបាន។',
      'Role deleted.': 'បានលុបតួនាទី។',
      'You cannot delete your own account while logged in.': 'អ្នកមិនអាចលុបគណនីខ្លួនឯងពេលកំពុងចូលប្រើបានទេ។',
      'User deleted.': 'បានលុបអ្នកប្រើ។',
      'Symptom check deleted.': 'បានលុបការពិនិត្យរោគសញ្ញា។',
      'Use lowercase letters, numbers, dashes, or underscores only.': 'ប្រើតែអក្សរតូច លេខ សញ្ញា - ឬ _ ប៉ុណ្ណោះ។',
      'Field must be between 3 and 80 characters long.': 'ត្រូវមានប្រវែងពី 3 ដល់ 80 តួអក្សរ។',
      'Field must be between 6 and 128 characters long.': 'ត្រូវមានប្រវែងពី 6 ដល់ 128 តួអក្សរ។',
      'Field must be at least 6 characters long.': 'ត្រូវមានយ៉ាងតិច 6 តួអក្សរ។',
      'Field must be between 4 and 160 characters long.': 'ត្រូវមានប្រវែងពី 4 ដល់ 160 តួអក្សរ។',
      'This field is required.': 'ត្រូវបំពេញវាលនេះ។',
      'Invalid email address.': 'អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ។',
      'Field must be equal to password.': 'តម្លៃត្រូវតែដូចពាក្យសម្ងាត់។',
      'Monday': 'ចន្ទ',
      'Tuesday': 'អង្គារ',
      'Wednesday': 'ពុធ',
      'Thursday': 'ព្រហស្បតិ៍',
      'Friday': 'សុក្រ',
      'Saturday': 'សៅរ៍',
      'Sunday': 'អាទិត្យ',
      'Jan': 'មករា',
      'Feb': 'កុម្ភៈ',
      'Mar': 'មីនា',
      'Apr': 'មេសា',
      'Jun': 'មិថុនា',
      'Jul': 'កក្កដា',
      'Aug': 'សីហា',
      'Sep': 'កញ្ញា',
      'Oct': 'តុលា',
      'Nov': 'វិច្ឆិកា',
      'Dec': 'ធ្នូ',
      'AM': 'ព្រឹក',
      'PM': 'ល្ងាច',
      'Delete all symptom check history for ': 'លុបប្រវត្តិពិនិត្យរោគសញ្ញាទាំងអស់សម្រាប់ ',
      'Delete user ': 'លុបអ្នកប្រើ ',
      '? This will delete their symptom history too.': '? វានឹងលុបប្រវត្តិរោគសញ្ញារបស់ពួកគេផងដែរ។',
      'Delete this symptom from all diseases?': 'លុបរោគសញ្ញានេះចេញពីជំងឺទាំងអស់?',
      'Delete this symptom check history?': 'លុបប្រវត្តិពិនិត្យរោគសញ្ញានេះ?',
      '? This cannot be undone.': '? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។',
      'Delete role ': 'លុបតួនាទី ',
    },
  };

  const LOOSE_REGEX = {
    km: [
      { pattern: /(\d+)\s+result\(s\)/g, replace: '$1 លទ្ធផល' },
      { pattern: /(\d+)\s+match\(es\)/g, replace: '$1 ការផ្គូផ្គង' },
      { pattern: /(\d+)\s+disease\(s\)/g, replace: '$1 ជំងឺ' },
      { pattern: /(\d+)\s+item\(s\)/g, replace: '$1 ធាតុ' },
      { pattern: /(\d+)\s+symptom\(s\)/g, replace: '$1 រោគសញ្ញា' },
      { pattern: /(\d+)\s+selected\b/g, replace: '$1 បានជ្រើស' },
      { pattern: /(\d+)\s+visible\b/g, replace: '$1 មើលឃើញ' },
      { pattern: /(\d+)\s+shown\b/g, replace: '$1 បង្ហាញ' },
      { pattern: /\+(\d+)\s+more\b/g, replace: '+$1 បន្ថែម' },
      { pattern: /Check #(\d+)/g, replace: 'ការពិនិត្យ #$1' },
      { pattern: /Symptom check #(\d+)/g, replace: 'ការពិនិត្យរោគសញ្ញា #$1' },
      { pattern: /No match for symptom check #(\d+)/g, replace: 'មិនផ្គូផ្គងសម្រាប់ការពិនិត្យរោគសញ្ញា #$1' },
      { pattern: /Deleted (\d+) symptom check\(s\) for (.+)\./g, replace: 'បានលុបប្រវត្តិពិនិត្យរោគសញ្ញា $1 សម្រាប់ $2។' },
      { pattern: /(\d+)\s+disease\b/g, replace: '$1 ជំងឺ' },
    ],
  };

  const KM_FRAGMENT_ENTRIES = Object.entries(LOOSE_I18N.km || {})
    .filter(([source]) => source && source.length >= 3)
    .sort((a, b) => b[0].length - a[0].length);
  const looseTextOriginals = new WeakMap();
  const remoteTranslationCache = new Map();
  const pendingRemoteTranslations = new Set();
  let remoteTranslateTimer = null;
  let remoteTranslateInFlight = false;

  let currentLanguage = 'en';
  const originalDocumentTitle = document.title;

  function translateLooseText(lang, text) {
    if (!text) return text;
    if (lang !== 'km') return text;

    const exact = LOOSE_I18N.km[text];
    const remote = remoteTranslationCache.get(text);
    if (exact) return exact;
    if (remote && remote !== text) return remote;
    let translated = text;

    const rules = LOOSE_REGEX.km || [];
    rules.forEach((rule) => {
      translated = translated.replace(rule.pattern, rule.replace);
    });

    KM_FRAGMENT_ENTRIES.forEach(([source, target]) => {
      if (!source || source === translated) return;
      if (translated.includes(source)) {
        translated = translated.split(source).join(target);
      }
    });

    if (translated === text && remote) {
      return remote;
    }
    return translated;
  }

  function translateLooseString(lang, text) {
    return translateLooseText(lang, text);
  }

  function shouldQueueRemoteTranslation(text) {
    const sample = String(text || '').trim();
    if (!sample) return false;
    if (sample.length < 3 || sample.length > 4500) return false;
    if (!/[A-Za-z]/.test(sample)) return false;
    return !remoteTranslationCache.has(sample);
  }

  function queueRemoteTranslation(text) {
    if (currentLanguage !== 'km') return;
    const sample = String(text || '').trim();
    if (!shouldQueueRemoteTranslation(sample)) return;
    pendingRemoteTranslations.add(sample);
    if (remoteTranslateTimer) return;
    remoteTranslateTimer = setTimeout(flushRemoteTranslations, 90);
  }

  async function flushRemoteTranslations() {
    remoteTranslateTimer = null;
    if (currentLanguage !== 'km') return;
    if (remoteTranslateInFlight) return;
    if (!pendingRemoteTranslations.size) return;

    const batch = Array.from(pendingRemoteTranslations).slice(0, 40);
    batch.forEach((item) => pendingRemoteTranslations.delete(item));
    if (!batch.length) return;

    remoteTranslateInFlight = true;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: 'km',
          texts: batch,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        batch.forEach((text) => {
          const translated = typeof data?.[text] === 'string' ? data[text] : text;
          remoteTranslationCache.set(text, translated || text);
        });
        translateLooseContent('km');
      } else {
        batch.forEach((text) => remoteTranslationCache.set(text, text));
      }
    } catch (_) {
      batch.forEach((text) => remoteTranslationCache.set(text, text));
    } finally {
      remoteTranslateInFlight = false;
      if (pendingRemoteTranslations.size && currentLanguage === 'km') {
        remoteTranslateTimer = setTimeout(flushRemoteTranslations, 120);
      }
    }
  }

  function translateLooseContent(lang) {
    const isKhmer = lang === 'km';

    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (textWalker.nextNode()) {
      textNodes.push(textWalker.currentNode);
    }

    textNodes.forEach((node) => {
      if (!(node instanceof Text)) return;
      const parent = node.parentElement;
      if (!parent) return;
      if (parent.closest('script,style,noscript,textarea,code,pre')) return;
      if (parent.closest('[data-i18n], [data-i18n-placeholder], [data-i18n-title]')) return;

      const raw = node.nodeValue || '';
      if (!raw.trim()) return;

      if (isKhmer) {
        const source = looseTextOriginals.get(node) || raw;
        const translated = translateLooseText(lang, source);
        if (translated === source) {
          queueRemoteTranslation(source);
          return;
        }
        if (!looseTextOriginals.has(node)) {
          looseTextOriginals.set(node, source);
        }
        node.nodeValue = translated;
        return;
      }

      if (looseTextOriginals.has(node)) {
        node.nodeValue = looseTextOriginals.get(node);
      }
    });

    document.querySelectorAll('[placeholder]').forEach((node) => {
      if (!(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)) return;
      if (node.hasAttribute('data-i18n-placeholder')) return;
      const original = node.dataset.i18nLoosePlaceholder || node.getAttribute('placeholder') || '';
      if (!original) return;
      if (!node.dataset.i18nLoosePlaceholder) {
        node.dataset.i18nLoosePlaceholder = original;
      }
      if (isKhmer) {
        const translated = translateLooseText(lang, original);
        if (translated === original) queueRemoteTranslation(original);
        node.setAttribute('placeholder', translated);
        return;
      }
      node.setAttribute('placeholder', original);
    });

    document.querySelectorAll('[title]').forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.hasAttribute('data-i18n-title')) return;
      const original = node.dataset.i18nLooseTitle || node.getAttribute('title') || '';
      if (!original) return;
      if (!node.dataset.i18nLooseTitle) {
        node.dataset.i18nLooseTitle = original;
      }
      if (isKhmer) {
        const translated = translateLooseText(lang, original);
        if (translated === original) queueRemoteTranslation(original);
        node.setAttribute('title', translated);
        return;
      }
      node.setAttribute('title', original);
    });

    document.querySelectorAll('input[type="submit"], input[type="button"], input[type="reset"]').forEach((node) => {
      if (!(node instanceof HTMLInputElement)) return;
      const original = node.dataset.i18nLooseValue || node.value || '';
      if (!original) return;
      if (!node.dataset.i18nLooseValue) {
        node.dataset.i18nLooseValue = original;
      }
      if (isKhmer) {
        const translated = translateLooseText(lang, original);
        if (translated === original) queueRemoteTranslation(original);
        node.value = translated;
        return;
      }
      node.value = original;
    });

    document.querySelectorAll('[onsubmit]').forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const original = node.dataset.i18nLooseOnsubmit || node.getAttribute('onsubmit') || '';
      if (!original) return;
      if (!node.dataset.i18nLooseOnsubmit) {
        node.dataset.i18nLooseOnsubmit = original;
      }
      if (isKhmer) {
        const translated = translateLooseText(lang, original);
        if (translated === original) queueRemoteTranslation(original);
        node.setAttribute('onsubmit', translated);
        return;
      }
      node.setAttribute('onsubmit', original);
    });

    if (isKhmer) {
      const translatedTitle = translateLooseText(lang, originalDocumentTitle);
      if (translatedTitle === originalDocumentTitle) queueRemoteTranslation(originalDocumentTitle);
      document.title = translatedTitle;
    } else {
      document.title = originalDocumentTitle;
    }
  }

  function safeLanguage(lang) {
    return lang === 'km' ? 'km' : 'en';
  }

  function applyLanguage(lang) {
    const nextLang = safeLanguage(lang);
    currentLanguage = nextLang;
    root.setAttribute('lang', nextLang);

    try {
      localStorage.setItem('sf-language', nextLang);
    } catch (_) {}
    document.cookie = `sf-language=${nextLang}; path=/; max-age=31536000; samesite=lax`;

    const dict = I18N[nextLang] || I18N.en;
    const fallback = I18N.en;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (!key) return;
      const value = dict[key] || fallback[key];
      if (value) node.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.getAttribute('data-i18n-placeholder');
      if (!key || !(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)) return;
      const value = dict[key] || fallback[key];
      if (value) node.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((node) => {
      const key = node.getAttribute('data-i18n-title');
      if (!key) return;
      const value = dict[key] || fallback[key];
      if (!value) return;
      node.setAttribute('title', value);
      node.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-language-select]').forEach((node) => {
      if (node instanceof HTMLSelectElement) {
        node.value = nextLang;
      }
    });

    translateLooseContent(nextLang);

    if (nextLang === 'km' && pendingRemoteTranslations.size) {
      if (!remoteTranslateTimer) {
        remoteTranslateTimer = setTimeout(flushRemoteTranslations, 60);
      }
    }
  }

  const savedLanguage = (() => {
    try {
      return localStorage.getItem('sf-language');
    } catch (_) {
      return null;
    }
  })();
  applyLanguage(savedLanguage || 'en');

  document.addEventListener('change', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (!target.matches('[data-language-select]')) return;
    applyLanguage(target.value);
  });

  // ----- Theme -----
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem('sf-theme', theme);
    } catch (_) {}
  }

  const savedTheme = (() => {
    try {
      return localStorage.getItem('sf-theme');
    } catch (_) {
      return null;
    }
  })();

  if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
  }

  // ----- Sidebar -----
  function openSidebar() {
    body.classList.add('sf-sidebar-open');
  }
  function closeSidebar() {
    body.classList.remove('sf-sidebar-open');
  }
  function toggleSidebar() {
    body.classList.toggle('sf-sidebar-open');
  }

  // ----- Events -----
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;

    const action = t.closest('[data-action]')?.getAttribute('data-action');

    if (action === 'toggleTheme') {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
      return;
    }

    if (action === 'toggleSidebar') toggleSidebar();
    if (action === 'openSidebar') openSidebar();
  });

  // Close sidebar on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });

  // ----- Search suggestions -----
  const searchForm = document.querySelector('.sf-search');
  const searchInput = searchForm?.querySelector('.sf-search-input');
  const suggestBox = searchForm?.querySelector('[data-search-suggest]');
  let searchTimer = null;
  let abortController = null;

  function clearSuggestions() {
    if (!suggestBox) return;
    suggestBox.innerHTML = '';
    suggestBox.setAttribute('aria-hidden', 'true');
  }

  function renderSuggestions(items) {
    if (!suggestBox) return;
    if (!items.length) {
      suggestBox.innerHTML = `<div class="sf-suggest-empty">${translateLooseString(currentLanguage, 'No suggestions')}</div>`;
      suggestBox.setAttribute('aria-hidden', 'false');
      return;
    }
    suggestBox.innerHTML = items
      .map(
        (item) => `
        <a class="sf-suggest-item" href="${item.url}">
          <span class="sf-suggest-type">${translateLooseString(currentLanguage, item.type)}</span>
          <span class="sf-suggest-label">${item.label}</span>
        </a>
      `
      )
      .join('');
    suggestBox.setAttribute('aria-hidden', 'false');
    if (currentLanguage === 'km') {
      translateLooseContent('km');
    }
  }

  async function fetchSuggestions(query) {
    if (!suggestBox) return;
    if (abortController) abortController.abort();
    abortController = new AbortController();
    try {
      const res = await fetch(`/search/suggest?q=${encodeURIComponent(query)}`, {
        signal: abortController.signal,
      });
      if (!res.ok) {
        clearSuggestions();
        return;
      }
      const data = await res.json();
      renderSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        clearSuggestions();
      }
    }
  }

  if (searchInput && suggestBox) {
    searchInput.addEventListener('input', () => {
      const value = searchInput.value.trim();
      clearTimeout(searchTimer);
      if (value.length < 2) {
        clearSuggestions();
        return;
      }
      searchTimer = setTimeout(() => fetchSuggestions(value), 180);
    });

    searchInput.addEventListener('focus', () => {
      const value = searchInput.value.trim();
      if (value.length >= 2) {
        fetchSuggestions(value);
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearSuggestions();
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(clearSuggestions, 120);
    });

  }

  // ----- Hash tabs (home dashboard sections) -----
  function initHashTabs() {
    const tabGroups = Array.from(document.querySelectorAll('.sf-tabs'));
    if (!tabGroups.length) return;

    function parseHashFromHref(href) {
      if (!href || !href.startsWith('#')) return null;
      return href;
    }

    function setActiveTab(tabs, activeHash) {
      let hasMatch = false;
      tabs.forEach((tab) => {
        const tabHash = parseHashFromHref(tab.getAttribute('href'));
        const isActive = tabHash === activeHash;
        if (isActive) hasMatch = true;
        tab.classList.toggle('is-active', isActive);
        if (isActive) {
          tab.setAttribute('aria-current', 'page');
        } else {
          tab.removeAttribute('aria-current');
        }
      });

      if (!hasMatch && tabs.length) {
        tabs[0].classList.add('is-active');
        tabs[0].setAttribute('aria-current', 'page');
      }
    }

    tabGroups.forEach((group) => {
      const tabs = Array.from(group.querySelectorAll('.sf-tab[href^="#"]'));
      if (!tabs.length) return;

      const tabByHash = new Map();
      tabs.forEach((tab) => {
        const hash = parseHashFromHref(tab.getAttribute('href'));
        if (!hash) return;
        tabByHash.set(hash, tab);
      });

      function syncFromHash() {
        const hash = window.location.hash || '';
        if (hash && tabByHash.has(hash)) {
          setActiveTab(tabs, hash);
        } else {
          setActiveTab(tabs, parseHashFromHref(tabs[0].getAttribute('href')));
        }
      }

      tabs.forEach((tab) => {
        tab.addEventListener('click', (e) => {
          const hash = parseHashFromHref(tab.getAttribute('href'));
          if (!hash) return;

          const target = document.querySelector(hash);
          if (!target) return;

          e.preventDefault();
          setActiveTab(tabs, hash);
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', hash);
        });
      });

      syncFromHash();
      window.addEventListener('hashchange', syncFromHash);
    });
  }

  // ----- Diagnose page symptom filters -----
  function initDiagnoseFilters() {
    const diagnoseRoot = document.querySelector('[data-diagnose-root]');
    if (!diagnoseRoot) return;

    const searchField = diagnoseRoot.querySelector('[data-symptom-search]');
    const selectedOnly = diagnoseRoot.querySelector('[data-symptom-selected-only]');
    const clearBtn = diagnoseRoot.querySelector('[data-symptom-clear]');
    const filterButtons = Array.from(diagnoseRoot.querySelectorAll('[data-symptom-filter]'));
    const symptomItems = Array.from(diagnoseRoot.querySelectorAll('[data-symptom-item]'));
    const sections = Array.from(diagnoseRoot.querySelectorAll('[data-symptom-section]'));
    const selectedCountEl = diagnoseRoot.querySelector('[data-symptom-selected-count]');
    const visibleCountEl = diagnoseRoot.querySelector('[data-symptom-visible-count]');
    const emptyState = diagnoseRoot.querySelector('[data-symptom-empty]');

    let activeCategory = 'all';

    function getCheckboxes() {
      return Array.from(diagnoseRoot.querySelectorAll('[data-symptom-checkbox]'));
    }

    function setActiveFilterButton() {
      filterButtons.forEach((btn) => {
        const isActive = btn.getAttribute('data-symptom-filter') === activeCategory;
        btn.classList.toggle('is-active', isActive);
      });
    }

    function applyFilters() {
      const keyword = (searchField?.value || '').trim().toLowerCase();
      const selectedOnlyEnabled = !!selectedOnly?.checked;
      let visibleTotal = 0;

      symptomItems.forEach((item) => {
        const label = (item.getAttribute('data-symptom-label') || '').toLowerCase();
        const category = item.getAttribute('data-symptom-category') || '';
        const checkbox = item.querySelector('[data-symptom-checkbox]');
        const isChecked = !!checkbox?.checked;

        const matchesText = !keyword || label.includes(keyword);
        const matchesCategory = activeCategory === 'all' || category === activeCategory;
        const matchesSelected = !selectedOnlyEnabled || isChecked;
        const shouldShow = matchesText && matchesCategory && matchesSelected;

        item.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleTotal += 1;
      });

      sections.forEach((section) => {
        const sectionItems = Array.from(section.querySelectorAll('[data-symptom-item]'));
        const visibleInSection = sectionItems.filter((item) => item.style.display !== 'none').length;
        section.style.display = visibleInSection > 0 ? '' : 'none';

        const counter = section.querySelector('[data-symptom-section-count]');
        if (counter) counter.textContent = translateLooseString(currentLanguage, `${visibleInSection} shown`);
      });

      if (emptyState) emptyState.classList.toggle('d-none', visibleTotal > 0);
      if (visibleCountEl) visibleCountEl.textContent = String(visibleTotal);
      if (selectedCountEl) {
        selectedCountEl.textContent = String(getCheckboxes().filter((cb) => cb.checked).length);
      }
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-symptom-filter') || 'all';
        setActiveFilterButton();
        applyFilters();
      });
    });

    if (searchField) {
      searchField.addEventListener('input', applyFilters);
    }
    if (selectedOnly) {
      selectedOnly.addEventListener('change', applyFilters);
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        activeCategory = 'all';
        if (searchField) searchField.value = '';
        if (selectedOnly) selectedOnly.checked = false;
        setActiveFilterButton();
        applyFilters();
      });
    }

    getCheckboxes().forEach((cb) => cb.addEventListener('change', applyFilters));

    // Quick keyboard focus: "/" jumps to symptom search field.
    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || !searchField) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchField.focus();
    });

    setActiveFilterButton();
    applyFilters();
  }

  // ----- Add disease form: quick symptom appender -----
  function initSymptomsBuilder() {
    const forms = Array.from(document.querySelectorAll('form[data-symptoms-builder]'));
    if (!forms.length) return;

    function normalize(value) {
      return String(value || '')
        .replace(/^[-*•\s]+/, '')
        .trim()
        .replace(/\s+/g, ' ');
    }

    function parseTokens(raw) {
      return String(raw || '')
        .split(/[\n,;]+/)
        .map(normalize)
        .filter(Boolean);
    }

    forms.forEach((form) => {
      const textarea = form.querySelector('textarea[name="symptoms"]');
      const builder = form.querySelector('[data-symptom-builder]');
      const input = builder?.querySelector('[data-symptom-builder-input]');
      const categorySelect = builder?.querySelector('[data-symptom-builder-category]');
      const addBtn = builder?.querySelector('[data-symptom-builder-add]');
      if (!textarea || !builder || !input || !addBtn) return;

      function addFromInput() {
        const incoming = parseTokens(input.value);
        if (!incoming.length) return;
        const category = normalize(categorySelect?.value || '');

        const existing = parseTokens(textarea.value);
        const existingSet = new Set(existing.map((item) => item.toLowerCase()));
        const withCategory = incoming.map((item) =>
          category ? `${category}: ${item}` : item
        );

        const toAppend = withCategory.filter((item) => !existingSet.has(item.toLowerCase()));
        if (!toAppend.length) {
          input.value = '';
          return;
        }

        const merged = existing.concat(toAppend);
        textarea.value = merged.join('\n');
        input.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      addBtn.addEventListener('click', addFromInput);

      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        addFromInput();
      });
    });
  }

  // ----- Disease form symptom manager -----
  function initSymptomChecklistManager() {
    const form = document.querySelector('form[data-symptom-manager]');
    if (!form) return;

    const typeButtons = Array.from(form.querySelectorAll('[data-symptom-type]'));
    const sourceFields = Array.from(form.querySelectorAll('[data-symptom-source-key]'));
    const itemInput = form.querySelector('[data-symptom-item-input]');
    const saveBtn = form.querySelector('[data-symptom-save]');
    const cancelEditBtn = form.querySelector('[data-symptom-cancel-edit]');
    const activeTypeLabel = form.querySelector('[data-symptom-active-label]');
    const masterList = form.querySelector('[data-symptom-master-list]');
    const emptyState = form.querySelector('[data-symptom-empty]');
    const totalCountEl = form.querySelector('[data-symptom-total-count]');

    if (!typeButtons.length || !sourceFields.length || !itemInput || !saveBtn || !masterList) return;

    const sourceByKey = new Map();
    const typeMeta = new Map();
    const typeOrder = [];
    let selectedType = null;
    let editingId = null;
    let nextId = 1;
    let items = [];

    function splitTokens(raw) {
      return String(raw || '')
        .split(/[\n,;]+/)
        .map((v) => v.trim().replace(/\s+/g, ' '))
        .filter(Boolean);
    }

    function normalized(value) {
      return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
    }

    sourceFields.forEach((field) => {
      const key = field.getAttribute('data-symptom-source-key');
      if (!key) return;
      sourceByKey.set(key, field);
      typeOrder.push(key);
    });

    typeButtons.forEach((btn) => {
      const key = btn.getAttribute('data-symptom-type');
      if (!key) return;
      typeMeta.set(key, {
        title: btn.getAttribute('data-symptom-title') || key,
        placeholder: btn.getAttribute('data-symptom-placeholder') || 'Add symptom',
      });
      if (!selectedType || btn.classList.contains('is-active')) {
        selectedType = key;
      }
    });

    if (!selectedType && typeOrder.length) {
      selectedType = typeOrder[0];
    }

    function itemExists(typeKey, label, ignoreId = null) {
      const needle = normalized(label);
      return items.some(
        (item) =>
          item.typeKey === typeKey &&
          normalized(item.label) === needle &&
          (ignoreId === null || item.id !== ignoreId)
      );
    }

    function setSelectedType(typeKey) {
      if (!typeKey) return;
      selectedType = typeKey;
      typeButtons.forEach((btn) => {
        const key = btn.getAttribute('data-symptom-type');
        btn.classList.toggle('is-active', key === selectedType);
      });

      const meta = typeMeta.get(selectedType);
      if (activeTypeLabel) {
        activeTypeLabel.textContent = translateLooseString(currentLanguage, meta?.title || selectedType);
      }
      if (editingId === null) {
        itemInput.placeholder = translateLooseString(currentLanguage, meta?.placeholder || 'Add symptom');
      }
    }

    function resetEditor() {
      editingId = null;
      itemInput.value = '';
      const meta = typeMeta.get(selectedType);
      itemInput.placeholder = translateLooseString(currentLanguage, meta?.placeholder || 'Add symptom');
      saveBtn.textContent = translateLooseString(currentLanguage, 'Add');
      if (cancelEditBtn) cancelEditBtn.classList.add('d-none');
    }

    function syncSourcesAndCounts() {
      sourceByKey.forEach((field, key) => {
        const labels = items
          .filter((item) => item.typeKey === key)
          .map((item) => item.label);
        field.value = labels.join('\n');

        const countBadge = form.querySelector(`[data-symptom-tab-count="${key}"]`);
        if (countBadge) countBadge.textContent = String(labels.length);
      });

      if (totalCountEl) totalCountEl.textContent = String(items.length);
    }

    function renderList() {
      masterList.innerHTML = '';

      typeOrder.forEach((typeKey) => {
        const meta = typeMeta.get(typeKey);
        const groupItems = items
          .filter((item) => item.typeKey === typeKey)
          .sort((a, b) => a.label.localeCompare(b.label));

        const group = document.createElement('div');
        group.className = 'sf-symptom-group';

        const header = document.createElement('div');
        header.className = 'sf-symptom-group-head';
        const title = document.createElement('span');
        title.className = 'sf-symptom-group-title';
        title.textContent = meta?.title || typeKey;
        const count = document.createElement('span');
        count.className = 'sf-symptom-group-count';
        count.textContent = `${groupItems.length}`;
        header.append(title, count);
        group.appendChild(header);

        if (!groupItems.length) {
          const empty = document.createElement('div');
          empty.className = 'small text-muted';
          empty.textContent = translateLooseString(currentLanguage, 'No items in this type.');
          group.appendChild(empty);
        } else {
          const list = document.createElement('div');
          list.className = 'sf-symptom-rows';

          groupItems.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'sf-symptom-row';

            const label = document.createElement('div');
            label.className = 'sf-symptom-row-label';
            label.textContent = item.label;

            const actions = document.createElement('div');
            actions.className = 'd-flex gap-2';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-outline-dark';
            editBtn.setAttribute('data-symptom-edit-id', String(item.id));
            editBtn.textContent = translateLooseString(currentLanguage, 'Edit');

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.setAttribute('data-symptom-delete-id', String(item.id));
            deleteBtn.textContent = translateLooseString(currentLanguage, 'Delete');

            actions.append(editBtn, deleteBtn);
            row.append(label, actions);
            list.appendChild(row);
          });

          group.appendChild(list);
        }

        masterList.appendChild(group);
      });

      if (emptyState) {
        emptyState.classList.toggle('d-none', items.length > 0);
      }
    }

    function startEdit(id) {
      const item = items.find((it) => it.id === id);
      if (!item) return;

      editingId = id;
      setSelectedType(item.typeKey);
      itemInput.value = item.label;
      itemInput.placeholder = translateLooseString(currentLanguage, 'Update symptom item');
      saveBtn.textContent = translateLooseString(currentLanguage, 'Update');
      if (cancelEditBtn) cancelEditBtn.classList.remove('d-none');
      itemInput.focus();
    }

    function saveItem() {
      const tokens = splitTokens(itemInput.value);
      if (!tokens.length || !selectedType) return;

      if (editingId !== null) {
        const updatedLabel = tokens[0];
        const row = items.find((it) => it.id === editingId);
        if (!row) {
          resetEditor();
          return;
        }
        if (!itemExists(selectedType, updatedLabel, editingId)) {
          row.label = updatedLabel;
          row.typeKey = selectedType;
        }
        resetEditor();
      } else {
        tokens.forEach((label) => {
          if (!itemExists(selectedType, label)) {
            items.push({ id: nextId++, typeKey: selectedType, label });
          }
        });
        itemInput.value = '';
      }

      syncSourcesAndCounts();
      renderList();
    }

    function deleteItem(id) {
      items = items.filter((item) => item.id !== id);
      if (editingId === id) {
        resetEditor();
      }
      syncSourcesAndCounts();
      renderList();
    }

    // Load existing values from hidden source fields.
    sourceByKey.forEach((field, typeKey) => {
      const seen = new Set();
      splitTokens(field.value).forEach((label) => {
        const key = normalized(label);
        if (!key || seen.has(key)) return;
        seen.add(key);
        items.push({ id: nextId++, typeKey, label });
      });
    });

    typeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const typeKey = btn.getAttribute('data-symptom-type');
        if (typeKey) setSelectedType(typeKey);
      });
    });

    saveBtn.addEventListener('click', saveItem);

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', resetEditor);
    }

    itemInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveItem();
      }
    });

    masterList.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const editBtn = target.closest('[data-symptom-edit-id]');
      if (editBtn) {
        const id = Number(editBtn.getAttribute('data-symptom-edit-id'));
        if (Number.isInteger(id)) startEdit(id);
        return;
      }

      const deleteBtn = target.closest('[data-symptom-delete-id]');
      if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute('data-symptom-delete-id'));
        if (Number.isInteger(id)) deleteItem(id);
      }
    });

    form.addEventListener('submit', () => {
      if (itemInput.value.trim()) {
        saveItem();
      } else {
        syncSourcesAndCounts();
      }
    });

    setSelectedType(selectedType);
    resetEditor();
    syncSourcesAndCounts();
    renderList();
  }

  initSymptomsBuilder();
  initSymptomChecklistManager();
  initHashTabs();
  initDiagnoseFilters();
  translateLooseContent(currentLanguage);
})();
