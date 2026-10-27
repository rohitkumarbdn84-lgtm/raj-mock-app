RAJ MOCK TEST — Android Studio project
======================================

यह Android app project आपकी मौजूदा live वेबसाइट को Android WebView में खोलता है:
https://rajmocktest.netlify.app/

इस तरीके का फायदा:
- वेबसाइट में Admin द्वारा जोड़े गए टेस्ट उसी live वेबसाइट के जरिए ऐप में भी दिखाई देंगे।
- अलग Android database बनाकर टेस्ट दो बार डालने की जरूरत नहीं।
- वेबसाइट/Firebase के मौजूदा login, test और result flow का उपयोग होता है।
- वेबसाइट में अपडेट करने पर ऐप में भी वही अपडेट दिखता है।
- HTML file chooser का सपोर्ट है, ताकि वेबसाइट के upload controls काम कर सकें।

Android Studio में खोलना:
1. Android Studio इंस्टॉल करें और SDK Platform 35 इंस्टॉल होने दें।
2. File > Open से इस प्रोजेक्ट का folder खोलें (RAJ_MOCK_TEST_ANDROID).
3. Gradle Sync पूरा होने दें।
4. Emulator या Android फोन पर Run दबाकर टेस्ट करें।
5. Play Store के लिए Build > Generate Signed Bundle / APK > Android App Bundle चुनें।

महत्वपूर्ण सीमाएँ:
- इस environment में Android SDK/Gradle build tool उपलब्ध नहीं था, इसलिए इस ZIP में compiled APK/AAB शामिल नहीं है।
- Play Store पर प्रकाशित करने से पहले वास्तविक फोन पर login, registration, password reset, image upload, test timer, results, payment और back navigation को जाँचें।
- Firebase web configuration source में सामान्यतः client-side होती है; असली सुरक्षा Firebase Security Rules और Authentication settings से आती है। कोई service-account private key शामिल न करें।
- Firebase Authentication के OAuth/popup आधारित flows WebView में अलग व्यवहार कर सकते हैं; यदि साइट ऐसा flow इस्तेमाल करती है, तो उसे Android-compatible sign-in से जाँचना होगा।
- App अभी live Netlify website पर निर्भर है और इंटरनेट जरूरी है। यह native offline test engine नहीं है।
- App ID: com.rajmocktest.app; version 1.0.0. Play Store पर जाने से पहले privacy policy, Data safety form, app access instructions और current target API requirements पूरे करें।

Android Studio के बिना APK बनाने का विकल्प (GitHub cloud build)
---------------------------------------------------------------
1. GitHub पर sign in करें और नया repository बनाएं (Public या Private).
2. इस ZIP की सभी files repository में upload करके main branch में commit करें.
3. GitHub repository में Actions tab खोलें.
4. "Build RAJ MOCK TEST Android APK" workflow चुनें और Run workflow दबाएं
   (या main branch में push करने पर build अपने आप चलेगा).
5. Build सफल होने पर workflow run के नीचे Artifacts में
   raj-mock-test-debug-apk डाउनलोड करें.
6. APK केवल परीक्षण के लिए debug build है. Play Store के लिए signed release AAB,
   signing key, privacy policy और Play Console की जरूरत होगी.

ध्यान दें: GitHub cloud build करने के लिए GitHub account और repository में files upload करना जरूरी है.
यह ZIP खुद से APK नहीं बनाती और इस ZIP में compiled APK शामिल नहीं है.
