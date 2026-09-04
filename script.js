/* =========================
   اتصال به Supabase
========================= */

const SUPABASE_URL =
    "https://jjoxrvcstonuzvfutcbl.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_P2aV9jQxA9rTqkeXHdu23w_s5-HbjyC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================
   متغیرها
========================= */

let topics = [];

let currentTopicId = null;

let currentUser = null;

let authMode = "login";


/* =========================
   ورود
========================= */

function openLogin() {

    authMode = "login";

    updateAuthModal();

    document.getElementById("authModal")
        .style.display = "block";
}


/* =========================
   ثبت نام
========================= */

function openRegister() {

    authMode = "register";

    updateAuthModal();

    document.getElementById("authModal")
        .style.display = "block";
}


/* =========================
   تغییر ورود / ثبت نام
========================= */

function switchAuth() {

    authMode =
        authMode === "login"
            ? "register"
            : "login";

    updateAuthModal();
}


/* =========================
   بروزرسانی فرم
========================= */

function updateAuthModal() {

    const title =
        document.getElementById("authTitle");

    const button =
        document.getElementById("authSubmit");

    const username =
        document.getElementById("authUsername");

    const switchText =
        document.getElementById("authSwitch");

    const message =
        document.getElementById("authMessage");


    message.textContent = "";

    message.style.color = "#d00";


    if (authMode === "login") {

        title.textContent =
            "ورود به نیکی فمیلی";

        button.textContent =
            "ورود";

        username.style.display =
            "none";

        switchText.textContent =
            "حساب ندارید؟ ثبت نام کنید";

    } else {

        title.textContent =
            "ثبت نام در نیکی فمیلی";

        button.textContent =
            "ثبت نام";

        username.style.display =
            "block";

        switchText.textContent =
            "قبلاً حساب ساخته‌اید؟ ورود";

    }
}


/* =========================
   بستن فرم احراز هویت
========================= */

function closeAuth() {

    document.getElementById("authModal")
        .style.display = "none";

}


/* =========================
   ثبت نام / ورود
========================= */

async function submitAuth() {

    const email =
        document.getElementById("authEmail")
            .value
            .trim();

    const password =
        document.getElementById("authPassword")
            .value;

    const message =
        document.getElementById("authMessage");


    if (!email || !password) {

        message.textContent =
            "لطفاً ایمیل و رمز عبور را وارد کنید.";

        return;
    }


    /* ثبت نام */

    if (authMode === "register") {

        const username =
            document.getElementById("authUsername")
                .value
                .trim();


        if (!username) {

            message.textContent =
                "لطفاً نام خود را وارد کنید.";

            return;
        }


        if (password.length < 6) {

            message.textContent =
                "رمز عبور باید حداقل ۶ کاراکتر باشد.";

            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {

                        username: username

                    }

                }

            });


        if (error) {

            console.error(error);

            message.textContent =
                error.message;

            return;
        }


        if (data.session) {

            message.style.color =
                "green";

            message.textContent =
                "ثبت نام با موفقیت انجام شد.";

            closeAuth();

        } else {

            message.style.color =
                "green";

            message.textContent =
                "ثبت نام انجام شد. ایمیل خود را برای تأیید حساب بررسی کنید.";

        }

        return;
    }


    /* ورود */

    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });


    if (error) {

        message.textContent =
            "ایمیل یا رمز عبور اشتباه است.";

        return;
    }


    currentUser =
        data.user;


    closeAuth();

    updateUserUI();

}


/* =========================
   خروج
========================= */

async function logout() {

    const {
        error
    } =
        await supabaseClient.auth
            .signOut();


    if (error) {

        console.error(error);

        return;
    }


    currentUser = null;

    updateUserUI();

}


/* =========================
   نمایش وضعیت کاربر
========================= */

function updateUserUI() {

    const loginButton =
        document.getElementById("loginButton");

    const registerButton =
        document.getElementById("registerButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const userDisplay =
        document.getElementById("userDisplay");


    if (currentUser) {

        loginButton.style.display =
            "none";

        registerButton.style.display =
            "none";

        logoutButton.style.display =
            "inline-block";

        const username =
            currentUser.user_metadata
                ?.username;


        userDisplay.textContent =
            username
                ? "سلام " + username
                : currentUser.email;

        userDisplay.style.display =
            "inline-block";

    } else {

        loginButton.style.display =
            "inline-block";

        registerButton.style.display =
            "inline-block";

        logoutButton.style.display =
            "none";

        userDisplay.style.display =
            "none";

    }

}


/* =========================
   دریافت تاپیک‌ها
========================= */

async function loadTopics() {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("topics")

            .select("*")

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Topics error:",
            error
        );

        document.getElementById(
            "topics"
        ).innerHTML = `

            <div class="empty">

                دریافت تاپیک‌ها با مشکل مواجه شد.

            </div>

        `;

        return;
    }


    topics =
        data || [];


    await displayTopics();

}


/* =========================
   گرفتن تعداد پاسخ‌های هر تاپیک
========================= */

async function getReplyCount(topicId) {

    const {
        count,
        error
    } =
        await supabaseClient

            .from("replies")

            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )

            .eq(
                "topic_id",
                topicId
            );


    if (error) {

        console.error(error);

        return 0;
    }


    return count || 0;

}


/* =========================
   نمایش تاپیک‌ها
========================= */

async function displayTopics(
    list = topics
) {

    const container =
        document.getElementById(
            "topics"
        );


    document.getElementById(
        "topicCount"
    ).textContent =
        list.length + " تاپیک";


    if (list.length === 0) {

        container.innerHTML = `

            <div class="empty">

                تاپیکی پیدا نشد 😕

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    const reversed =
        [...list].reverse();


    for (
        const topic of reversed
    ) {

        const replyCount =
            await getReplyCount(
                topic.id
            );


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "topic";


        div.onclick =
            () => openTopic(
                topic.id
            );


        div.innerHTML = `

            <h3>

                ${escapeHTML(
                    topic.title
                )}

            </h3>

            <div class="topic-info">

                توسط
                ${escapeHTML(
                    topic.username
                )}

                •
                ${formatDate(
                    topic.created_at
                )}

                •
                ${replyCount}
                پاسخ

            </div>

            <div class="topic-preview">

                ${escapeHTML(
                    topic.text.substring(
                        0,
                        120
                    )
                )}

                ${
                    topic.text.length > 120
                        ? "..."
                        : ""
                }

            </div>

        `;


        container.appendChild(
            div
        );

    }

}


/* =========================
   باز کردن فرم تاپیک
========================= */

function openTopicForm() {

    if (!currentUser) {

        alert(
            "برای ساخت تاپیک ابتدا وارد حساب خود شوید."
        );

        openLogin();

        return;
    }


    document.getElementById(
        "topicModal"
    ).style.display =
        "block";


    const usernameInput =
        document.getElementById(
            "username"
        );


    const savedUsername =
        currentUser.user_metadata
            ?.username;


    if (savedUsername) {

        usernameInput.value =
            savedUsername;

    }

}


/* =========================
   بستن فرم تاپیک
========================= */

function closeTopicForm() {

    document.getElementById(
        "topicModal"
    ).style.display =
        "none";

}


/* =========================
   ساخت تاپیک
========================= */

async function createTopic() {

    if (!currentUser) {

        alert(
            "برای ساخت تاپیک ابتدا وارد حساب خود شوید."
        );

        openLogin();

        return;
    }


    const username =
        document.getElementById(
            "username"
        ).value.trim();

    const title =
        document.getElementById(
            "topicTitle"
        ).value.trim();

    const text =
        document.getElementById(
            "topicText"
        ).value.trim();


    if (!username ||
        !title ||
        !text) {

        alert(
            "لطفاً همه قسمت‌ها را پر کنید."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient

            .from("topics")

            .insert({

                title: title,

                text: text,

                username: username

            });


    if (error) {

        console.error(
            "Create topic error:",
            error
        );

        alert(
            "ساخت تاپیک انجام نشد."
        );

        return;
    }


    document.getElementById(
        "username"
    ).value = "";

    document.getElementById(
        "topicTitle"
    ).value = "";

    document.getElementById(
        "topicText"
    ).value = "";


    closeTopicForm();


    await loadTopics();

}


/* =========================
   باز کردن تاپیک
========================= */

async function openTopic(id) {

    currentTopicId =
        id;


    const topic =
        topics.find(
            t => t.id === id
        );


    if (!topic) return;


    const content =
        document.getElementById(
            "topicContent"
        );


    content.innerHTML = `

        <h2 class="topic-main-title">

            ${escapeHTML(
                topic.title
            )}

        </h2>

        <div class="topic-author">

            توسط
            ${escapeHTML(
                topic.username
            )}

            •

            ${formatDate(
                topic.created_at
            )}

        </div>

        <div class="topic-body">

            ${escapeHTML(
                topic.text
            )}

        </div>

        <div id="repliesContainer">

            در حال دریافت پاسخ‌ها...

        </div>

    `;


    document.getElementById(
        "topicView"
    ).style.display =
        "block";


    await loadReplies(id);

}


/* =========================
   دریافت پاسخ‌ها
========================= */

async function loadReplies(
    topicId
) {

    const container =
        document.getElementById(
            "repliesContainer"
        );


    const {
        data,
        error
    } =
        await supabaseClient

            .from("replies")

            .select("*")

            .eq(
                "topic_id",
                topicId
            )

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Replies error:",
            error
        );

        container.innerHTML =
            "<p>دریافت پاسخ‌ها ناموفق بود.</p>";

        return;
    }


    if (!data ||
        data.length === 0) {

        container.innerHTML = `

            <h3>
                پاسخ‌ها
            </h3>

            <p
                style="
                    color:#777;
                    margin:15px 0
                ">

                هنوز کسی پاسخ نداده است.

            </p>

        `;

        return;
    }


    let html =
        "<h3>پاسخ‌ها</h3>";


    data.forEach(
        reply => {

            html += `

                <div class="reply">

                    <strong>

                        ${escapeHTML(
                            reply.username
                        )}

                    </strong>

                    <small>

                        ${formatDate(
                            reply.created_at
                        )}

                    </small>

                    <div>

                        ${escapeHTML(
                            reply.text
                        )}

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/* =========================
   بستن تاپیک
========================= */

function closeTopic() {

    document.getElementById(
        "topicView"
    ).style.display =
        "none";

}


/* =========================
   ارسال پاسخ
========================= */

async function addReply() {

    if (!currentUser) {

        alert(
            "برای پاسخ دادن ابتدا وارد حساب شوید."
        );

        openLogin();

        return;
    }


    const name =
        document.getElementById(
            "replyName"
        ).value.trim();

    const text =
        document.getElementById(
            "replyText"
        ).value.trim();


    if (!name || !text) {

        alert(
            "لطفاً نام و پاسخ را وارد کنید."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient

            .from("replies")

            .insert({

                topic_id:
                    currentTopicId,

                username:
                    name,

                text:
                    text

            });


    if (error) {

        console.error(
            "Reply error:",
            error
        );

        alert(
            "ارسال پاسخ انجام نشد."
        );

        return;
    }


    document.getElementById(
        "replyName"
    ).value = "";

    document.getElementById(
        "replyText"
    ).value = "";


    await loadReplies(
        currentTopicId
    );

    await loadTopics();

}


/* =========================
   جستجو
========================= */

async function searchTopics() {

    const query =
        document.getElementById(
            "searchInput"
        )
        .value
        .toLowerCase()
        .trim();


    const result =
        topics.filter(
            topic =>

                topic.title
                    .toLowerCase()
                    .includes(query)

                ||

                topic.text
                    .toLowerCase()
                    .includes(query)

                ||

                topic.username
                    .toLowerCase()
                    .includes(query)

        );


    await displayTopics(
        result
    );

}


/* =========================
   تاریخ
========================= */

function formatDate(date) {

    if (!date) return "";

    return new Date(date)
        .toLocaleDateString(
            "fa-IR"
        );

}


/* =========================
   جلوگیری از HTML Injection
========================= */

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================
   شروع سایت
========================= */

async function init() {

    const {
        data
    } =
        await supabaseClient.auth
            .getSession();


    currentUser =
        data.session
            ? data.session.user
            : null;


    updateUserUI();


    await loadTopics();


    supabaseClient.auth
        .onAuthStateChange(
            (_event, session) => {

                currentUser =
                    session
                        ? session.user
                        : null;

                updateUserUI();

            }
        );

}


init();
