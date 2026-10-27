// ==========================================
// RAJ MOCK TEST V2.0
// SUBSCRIPTION ENGINE
// PREMIUM STATUS + EXPIRY
// FIRESTORE
// ==========================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// ELEMENTS
// ==========================================

const currentPlanElement =
    document.getElementById("currentPlan");

const subscriptionStatusElement =
    document.getElementById("subscriptionStatus");

const expiryDateElement =
    document.getElementById("expiryDate");

const upgradeBtn =
    document.getElementById("upgradeBtn");

const backBtn =
    document.getElementById("backBtn");


// ==========================================
// COLLECTION
// ==========================================

const SUBSCRIPTION_COLLECTION =
    "subscriptions";


// ==========================================
// GET STUDENT
// ==========================================

function getStudent() {

    let oldStudent = null;

    try {

        const data =
            sessionStorage.getItem("student");

        if (data) {

            oldStudent =
                JSON.parse(data);

        }

    } catch (error) {

        console.error(
            "❌ Student JSON Error:",
            error
        );

    }


    console.log(
        "🔍 Searching student information..."
    );


    console.log(
        "👤 sessionStorage student:",
        oldStudent
    );


    const mobile =
        localStorage.getItem("studentMobile") ||
        sessionStorage.getItem("studentMobile") ||
        localStorage.getItem("studentId") ||
        sessionStorage.getItem("studentId") ||
        oldStudent?.mobile ||
        oldStudent?.phone ||
        oldStudent?.mobileNumber ||
        "";


    const name =
        localStorage.getItem("studentName") ||
        sessionStorage.getItem("studentName") ||
        oldStudent?.name ||
        "Student";


    const email =
        localStorage.getItem("studentEmail") ||
        sessionStorage.getItem("studentEmail") ||
        oldStudent?.email ||
        "";


    return {

        mobile:
            String(mobile).trim(),

        name:
            name,

        email:
            email

    };

}


// ==========================================
// SHOW FREE PLAN
// ==========================================

function showFreePlan(
    status = "Active"
) {

    console.log(
        "🆓 Showing Free Plan:",
        status
    );


    if (currentPlanElement) {

        currentPlanElement.textContent =
            "Free";

    }


    if (subscriptionStatusElement) {

        subscriptionStatusElement.textContent =
            status;

    }


    if (expiryDateElement) {

        expiryDateElement.textContent =
            "--";

    }


    if (upgradeBtn) {

        upgradeBtn.disabled =
            false;

        upgradeBtn.textContent =
            "💎 Upgrade to Premium";

        upgradeBtn.style.opacity =
            "1";

        upgradeBtn.style.cursor =
            "pointer";

    }

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatExpiryDate(value) {

    if (!value) {

        return "--";

    }


    let date = null;


    try {

        // Firestore Timestamp

        if (
            value &&
            typeof value.toDate ===
            "function"
        ) {

            date =
                value.toDate();

        }


        // Firestore timestamp object

        else if (
            typeof value === "object" &&
            value.seconds !== undefined
        ) {

            date =
                new Date(
                    Number(value.seconds) * 1000
                );

        }


        // Date object

        else if (
            value instanceof Date
        ) {

            date =
                value;

        }


        // String / number

        else {

            date =
                new Date(value);

        }


        if (
            !date ||
            Number.isNaN(
                date.getTime()
            )
        ) {

            console.warn(
                "⚠️ Invalid expiry date:",
                value
            );

            return "--";

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    } catch (error) {

        console.error(
            "❌ Date format error:",
            error
        );

        return "--";

    }

}


// ==========================================
// GET EXPIRY DATE
// ==========================================

function getExpiryDate(value) {

    if (!value) {

        return null;

    }


    try {

        // Firestore Timestamp

        if (
            value &&
            typeof value.toDate ===
            "function"
        ) {

            return value.toDate();

        }


        // Firestore timestamp object

        if (
            typeof value === "object" &&
            value.seconds !== undefined
        ) {

            return new Date(
                Number(value.seconds) * 1000
            );

        }


        // Date object

        if (
            value instanceof Date
        ) {

            return value;

        }


        // String / number

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return date;

    } catch {

        return null;

    }

}


// ==========================================
// SHOW PREMIUM
// ==========================================

function showPremium(
    data,
    expiry
) {

    console.log(
        "======================================"
    );

    console.log(
        "✅ PREMIUM ACTIVE"
    );

    console.log(
        "💎 Plan:",
        data.plan ||
        data.currentPlan
    );

    console.log(
        "📌 Status:",
        data.status ||
        data.subscriptionStatus
    );

    console.log(
        "📅 Expiry:",
        expiry
    );

    console.log(
        "======================================"
    );


    if (currentPlanElement) {

        currentPlanElement.textContent =
            "Premium";

    }


    if (subscriptionStatusElement) {

        subscriptionStatusElement.textContent =
            "Active";

    }


    if (expiryDateElement) {

        expiryDateElement.textContent =
            formatExpiryDate(
                expiry
            );

    }


    if (upgradeBtn) {

        upgradeBtn.disabled =
            true;

        upgradeBtn.textContent =
            "✅ Premium Active";

        upgradeBtn.style.opacity =
            "0.65";

        upgradeBtn.style.cursor =
            "not-allowed";


        upgradeBtn.onclick =
            function (event) {

                event.preventDefault();

                alert(
                    "💎 Premium already active!\n\n" +
                    "Expiry Date: " +
                    formatExpiryDate(expiry)
                );

            };

    }

}


// ==========================================
// SHOW EXPIRED
// ==========================================

function showExpired(expiry) {

    console.log(
        "⛔ PREMIUM EXPIRED"
    );


    if (currentPlanElement) {

        currentPlanElement.textContent =
            "Free";

    }


    if (subscriptionStatusElement) {

        subscriptionStatusElement.textContent =
            "Expired";

    }


    if (expiryDateElement) {

        expiryDateElement.textContent =
            formatExpiryDate(expiry);

    }


    if (upgradeBtn) {

        upgradeBtn.disabled =
            false;

        upgradeBtn.textContent =
            "💎 Upgrade to Premium";

        upgradeBtn.style.opacity =
            "1";

        upgradeBtn.style.cursor =
            "pointer";

    }

}


// ==========================================
// FIND SUBSCRIPTION
// ==========================================

async function findSubscription(
    mobile
) {

    console.log(
        "📱 Searching subscription for:",
        mobile
    );


    // ======================================
    // METHOD 1
    // DOCUMENT ID = MOBILE
    // ======================================

    console.log(
        "1️⃣ Checking document ID:"
    );

    console.log(
        `${SUBSCRIPTION_COLLECTION}/${mobile}`
    );


    const directRef =
        doc(
            db,
            SUBSCRIPTION_COLLECTION,
            mobile
        );


    const directSnap =
        await getDoc(
            directRef
        );


    console.log(
        "📄 Direct document exists:",
        directSnap.exists()
    );


    if (
        directSnap.exists()
    ) {

        console.log(
            "✅ Subscription found by document ID"
        );


        return {

            id:
                directSnap.id,

            data:
                directSnap.data()

        };

    }


    // ======================================
    // METHOD 2
    // SEARCH mobile FIELD
    // ======================================

    console.log(
        "2️⃣ Document ID नहीं मिला."
    );

    console.log(
        "🔎 Searching mobile field..."
    );


    try {

        const subscriptionRef =
            collection(
                db,
                SUBSCRIPTION_COLLECTION
            );


        const q =
            query(
                subscriptionRef,
                where(
                    "mobile",
                    "==",
                    mobile
                )
            );


        const snapshot =
            await getDocs(q);


        console.log(
            "🔎 Mobile query documents:",
            snapshot.size
        );


        if (
            !snapshot.empty
        ) {

            const firstDoc =
                snapshot.docs[0];


            console.log(
                "✅ Subscription found by mobile field"
            );


            console.log(
                "📄 Actual Document ID:",
                firstDoc.id
            );


            return {

                id:
                    firstDoc.id,

                data:
                    firstDoc.data()

            };

        }

    } catch (error) {

        console.error(
            "❌ Mobile field search error:",
            error
        );

    }


    // ======================================
    // METHOD 3
    // SEARCH STRING MOBILE
    // ======================================

    console.log(
        "3️⃣ Trying alternative mobile formats..."
    );


    const alternatives = [

        String(mobile),

        String(mobile).trim(),

        String(mobile).replace(/\s+/g, "")

    ];


    for (
        const value of alternatives
    ) {

        try {

            const q =
                query(
                    collection(
                        db,
                        SUBSCRIPTION_COLLECTION
                    ),
                    where(
                        "mobile",
                        "==",
                        value
                    )
                );


            const snapshot =
                await getDocs(q);


            if (
                !snapshot.empty
            ) {

                const firstDoc =
                    snapshot.docs[0];


                console.log(
                    "✅ Subscription found:"
                );

                console.log(
                    "📄 Document ID:",
                    firstDoc.id
                );


                return {

                    id:
                        firstDoc.id,

                    data:
                        firstDoc.data()

                };

            }

        } catch (error) {

            console.warn(
                "⚠️ Alternative search failed:",
                value,
                error
            );

        }

    }


    return null;

}


// ==========================================
// LOAD SUBSCRIPTION
// ==========================================

async function loadSubscription() {

    console.log(
        "=========================================="
    );

    console.log(
        "💎 SUBSCRIPTION CHECK STARTED"
    );

    console.log(
        "=========================================="
    );


    const student =
        getStudent();


    console.log(
        "👤 Student:",
        student
    );


    // ======================================
    // CHECK MOBILE
    // ======================================

    if (!student.mobile) {

        console.error(
            "❌ Student mobile/ID not found"
        );

        showFreePlan(
            "Login Required"
        );

        return;

    }


    console.log(
        "📱 Detected Student ID/Mobile:",
        student.mobile
    );


    try {

        // ==================================
        // FIND SUBSCRIPTION
        // ==================================

        const subscription =
            await findSubscription(
                student.mobile
            );


        // ==================================
        // NO SUBSCRIPTION
        // ==================================

        if (!subscription) {

            console.warn(
                "⚠️ Subscription document NOT FOUND"
            );

            showFreePlan(
                "Active"
            );

            return;

        }


        // ==================================
        // DATA
        // ==================================

        const data =
            subscription.data;


        console.log(
            "💎 FIRESTORE SUBSCRIPTION:",
            data
        );


        console.log(
            "📄 Subscription Document ID:",
            subscription.id
        );


        // ==================================
        // PLAN
        // ==================================

        let plan =
            String(
                data.plan ||
                data.currentPlan ||
                "Free"
            )
                .trim();


        // ==================================
        // STATUS
        // ==================================

        let status =
            String(
                data.status ||
                data.subscriptionStatus ||
                "Active"
            )
                .trim();


        // ==================================
        // EXPIRY
        // ==================================

        const expiry =
            data.expiry ||
            data.expiryDate ||
            data.expiresAt ||
            null;


        console.log(
            "📌 Plan:",
            plan
        );

        console.log(
            "📌 Status:",
            status
        );

        console.log(
            "📌 Expiry:",
            expiry
        );


        // ==================================
        // CHECK EXPIRY
        // ==================================

        const expiryDate =
            getExpiryDate(
                expiry
            );


        if (
            expiryDate &&
            expiryDate.getTime() <=
            Date.now()
        ) {

            showExpired(
                expiry
            );

            return;

        }


        // ==================================
        // NORMALIZE
        // ==================================

        const planLower =
            plan.toLowerCase();


        const statusLower =
            status.toLowerCase();


        // ==================================
        // PREMIUM
        // ==================================

        if (
            planLower === "premium"
        ) {

            // --------------------------------
            // IMPORTANT
            // --------------------------------
            // If expiry exists and is valid,
            // premium remains active until
            // expiry date.
            //
            // Status can be Active.
            // --------------------------------

            if (
                statusLower ===
                "active"
            ) {

                showPremium(
                    data,
                    expiry
                );

                return;

            }

        }


        // ==================================
        // FREE
        // ==================================

        console.log(
            "🆓 Subscription is not active Premium"
        );


        showFreePlan(
            status
        );

    } catch (error) {

        console.error(
            "❌ SUBSCRIPTION ERROR:",
            error
        );

        console.error(
            "❌ Error Code:",
            error.code
        );

        console.error(
            "❌ Error Message:",
            error.message
        );


        showFreePlan(
            "Error"
        );

    }

}


// ==========================================
// UPGRADE BUTTON
// ==========================================

if (upgradeBtn) {

    upgradeBtn.addEventListener(
        "click",
        function () {

            if (
                upgradeBtn.disabled
            ) {

                return;

            }


            console.log(
                "💳 Opening payment page..."
            );


            window.location.href =
                "payment-v2.html";

        }
    );

}


// ==========================================
// BACK BUTTON
// ==========================================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "student-dashboard-v2.html";

        }
    );

}


// ==========================================
// START
// ==========================================

console.log(
    "🚀 Raj Mock Test V2.0 Subscription Engine Started"
);


loadSubscription();