// =====================================================
// MTHIS TUTORIALS - SUPABASE AUTH
// =====================================================

const SUPABASE_URL =
    "https://bcpxdigpblgolreftfjx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_KMj2CtNM_uqqc5pjVh8V2Q_w9xydiX3";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// =====================================================
// LOGIN
// =====================================================

async function loginLearner(event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");

    message.innerHTML =
        "Logging in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


    if (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        message.innerHTML =
            "❌ " + error.message;

        return;
    }


    console.log(
        "LOGIN SUCCESS:",
        data
    );


    message.innerHTML =
        "✅ Login successful!";


    setTimeout(() => {

        window.location.href =
            "dashboard.html";

    }, 800);

}


// =====================================================
// REGISTER
// =====================================================

async function registerLearner(event) {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const surname =
        document.getElementById("surname").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const contact =
        document.getElementById("contact").value.trim();

    const grade =
        document.getElementById("grade").value;

    const subject =
        document.getElementById("subject").value;

    const password =
        document.getElementById("password").value;


    const message =
        document.getElementById("message");


    message.innerHTML =
        "Creating your account...";


    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                emailRedirectTo:
                    window.location.origin +
                    "/login.html",

                data: {

                    name: name,

                    surname: surname,

                    contact: contact,

                    grade: grade,

                    subject: subject

                }

            }

        });


    if (error) {

        console.error(
            "REGISTRATION ERROR:",
            error
        );

        message.innerHTML =
            "❌ " + error.message;

        return;
    }


    console.log(
        "REGISTRATION SUCCESS:",
        data
    );


    message.innerHTML =
        "✅ Account created! Please check your email and verify your account before logging in.";

}


// =====================================================
// CHECK LOGIN
// =====================================================

async function checkLogin() {

    console.log(
        "Checking logged-in user..."
    );


    const {
        data: {
            session
        },
        error
    } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "SESSION ERROR:",
            error
        );

        window.location.href =
            "login.html";

        return;
    }


    if (!session) {

        console.log(
            "No active session."
        );

        window.location.href =
            "login.html";

        return;
    }


    console.log(
        "Logged-in user:",
        session.user
    );


    loadLearnerProfile(
        session.user.id
    );

}


// =====================================================
// LOAD LEARNER PROFILE
// =====================================================

async function loadLearnerProfile(userId) {

    const learnerInfo =
        document.getElementById(
            "learnerInfo"
        );


    if (!learnerInfo) {

        console.error(
            "learnerInfo element not found."
        );

        return;
    }


    learnerInfo.innerHTML =
        "Loading profile...";


    console.log(
        "Searching learners table for:",
        userId
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("learners")
            .select("*")
            .eq("id", userId)
            .maybeSingle();


    console.log(
        "LEARNER DATA:",
        data
    );

    console.log(
        "LEARNER ERROR:",
        error
    );


    if (error) {

        console.error(
            "PROFILE DATABASE ERROR:",
            error
        );


        learnerInfo.innerHTML =
            "❌ Profile error: " +
            error.message;


        return;
    }


    if (!data) {

        console.error(
            "No learner profile found."
        );


        learnerInfo.innerHTML =
            "❌ No learner profile found.";

        return;
    }


    learnerInfo.innerHTML = `

        <div class="profile-row">

            <strong>Name</strong>

            <span>
                ${data.name || "-"}
            </span>

        </div>


        <div class="profile-row">

            <strong>Surname</strong>

            <span>
                ${data.surname || "-"}
            </span>

        </div>


        <div class="profile-row">

            <strong>Email</strong>

            <span>
                ${data.email || "-"}
            </span>

        </div>


        <div class="profile-row">

            <strong>Contact</strong>

            <span>
                ${data.contact || "-"}
            </span>

        </div>


        <div class="profile-row">

            <strong>Grade</strong>

            <span>
                ${data.grade || "-"}
            </span>

        </div>


        <div class="profile-row">

            <strong>Subject</strong>

            <span>
                ${data.subject || "-"}
            </span>

        </div>

    `;

}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

        return;
    }


    window.location.href =
        "login.html";
}
// =====================================================
// CHECK ADMIN ACCESS
// =====================================================

async function checkAdminAccess() {

    console.log("Checking administrator access...");

    const {
        data: {
            session
        },
        error: sessionError
    } = await supabaseClient.auth.getSession();


    // No login
    if (sessionError || !session) {

        console.log("No active admin session.");

        window.location.href = "admin-login.html";

        return false;
    }


    const userId =
        session.user.id;


    console.log(
        "Checking admin user:",
        userId
    );


    // =================================================
    // CHECK ADMINS TABLE
    // =================================================

    const {
        data: admin,
        error: adminError
    } =
        await supabaseClient
            .from("admins")
            .select("*")
            .eq("id", userId)
            .maybeSingle();


    if (adminError) {

        console.error(
            "ADMIN CHECK ERROR:",
            adminError
        );

        window.location.href =
            "dashboard.html";

        return false;
    }


    // =================================================
    // USER IS NOT ADMIN
    // =================================================

    if (!admin) {

        console.log(
            "ACCESS DENIED - USER IS NOT ADMIN"
        );


        await supabaseClient
            .auth
            .signOut();


        alert(
            "Access denied. Administrator access only."
        );


        window.location.href =
            "login.html";


        return false;
    }


    // =================================================
    // ADMIN VERIFIED
    // =================================================

    console.log(
        "ADMIN VERIFIED:",
        admin
    );


    return true;
}