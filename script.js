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


    topics = data || [];


    await displayTopics();

}


/* =========================
   تعداد پاسخ‌های تاپیک
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

        console.error(
            "Reply count error:",
            error
        );

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

                هنوز تاپیکی ساخته نشده 😕
                <br>
                اولین تاپیک را شما بسازید 💜

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


        const title =
            escapeHTML(
                topic.title || ""
            );


        const username =
            escapeHTML(
                topic.username || "ناشناس"
            );


        const text =
            String(
                topic.text || ""
            );


        const preview =
            escapeHTML(
                text.substring(
                    0,
                    120
                )
            );


        div.innerHTML = `

            <h3>

                ${title}

            </h3>

            <div class="topic-info">

                توسط
                ${username}

                •
                ${formatDate(
                    topic.created_at
                )}

                •
                ${replyCount}
                پاسخ

            </div>

            <div class="topic-preview">

                ${preview}

                ${
                    text.length > 120
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
   باز کردن فرم ساخت تاپیک
========================= */

function openTopicForm() {

    document.getElementById(
        "topicModal"
    ).style.display =
        "block";


    document.getElementById(
        "username"
    ).value = "";

    document.getElementById(
        "topicTitle"
    ).value = "";

    document.getElementById(
        "topicText"
    ).value = "";

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


    if (
        !username ||
        !title ||
        !text
    ) {

        alert(
            "لطفاً همه قسمت‌ها را پر کنید."
        );

        return;
    }


    if (username.length > 50) {

        alert(
            "نام شما نباید بیشتر از ۵۰ کاراکتر باشد."
        );

        return;
    }


    if (title.length > 150) {

        alert(
            "عنوان تاپیک نباید بیشتر از ۱۵۰ کاراکتر باشد."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("topics")
            .insert({

                title:
                    title,

                text:
                    text,

                username:
                    username

            });


    if (error) {

        console.error(
            "Create topic error:",
            error
        );

        alert(
            "ساخت تاپیک انجام نشد.\n\nممکن است تنظیمات دسترسی Supabase هنوز برای کاربران بدون حساب فعال نشده باشد."
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


    alert(
        "تاپیک با موفقیت ساخته شد 💜"
    );

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


    if (!topic) {

        return;
    }


    const content =
        document.getElementById(
            "topicContent"
        );


    content.innerHTML = `

        <h2 class="topic-main-title">

            ${escapeHTML(
                topic.title || ""
            )}

        </h2>


        <div class="topic-author">

            توسط
            ${escapeHTML(
                topic.username || "ناشناس"
            )}

            •

            ${formatDate(
                topic.created_at
            )}

        </div>


        <div class="topic-body">

            ${escapeHTML(
                topic.text || ""
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


    document.getElementById(
        "replyName"
    ).value = "";

    document.getElementById(
        "replyText"
    ).value = "";


    await loadReplies(
        id
    );

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

        container.innerHTML = `

            <p>
                دریافت پاسخ‌ها ناموفق بود.
            </p>

        `;

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

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
                            reply.username || "ناشناس"
                        )}

                    </strong>


                    <small>

                        ${formatDate(
                            reply.created_at
                        )}

                    </small>


                    <div>

                        ${escapeHTML(
                            reply.text || ""
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


    currentTopicId =
        null;

}


/* =========================
   ارسال پاسخ
========================= */

async function addReply() {

    if (!currentTopicId) {

        alert(
            "تاپیک انتخاب نشده است."
        );

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


    if (
        !name ||
        !text
    ) {

        alert(
            "لطفاً نام و پاسخ را وارد کنید."
        );

        return;
    }


    if (name.length > 50) {

        alert(
            "نام شما نباید بیشتر از ۵۰ کاراکتر باشد."
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
            "ارسال پاسخ انجام نشد.\n\nممکن است تنظیمات دسترسی Supabase هنوز برای کاربران بدون حساب فعال نشده باشد."
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


    alert(
        "پاسخ با موفقیت ارسال شد 💜"
    );

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
            topic => {

                const title =
                    String(
                        topic.title || ""
                    )
                    .toLowerCase();


                const text =
                    String(
                        topic.text || ""
                    )
                    .toLowerCase();


                const username =
                    String(
                        topic.username || ""
                    )
                    .toLowerCase();


                return (
                    title.includes(query) ||
                    text.includes(query) ||
                    username.includes(query)
                );

            }
        );


    await displayTopics(
        result
    );

}


/* =========================
   فرمت تاریخ
========================= */

function formatDate(date) {

    if (!date) {

        return "";

    }


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
   بستن Modal با کلیک بیرون
========================= */

window.addEventListener(
    "click",
    function(event) {

        const topicModal =
            document.getElementById(
                "topicModal"
            );


        const topicView =
            document.getElementById(
                "topicView"
            );


        if (
            event.target ===
            topicModal
        ) {

            closeTopicForm();

        }


        if (
            event.target ===
            topicView
        ) {

            closeTopic();

        }

    }
);


/* =========================
   شروع سایت
========================= */

async function init() {

    await loadTopics();

}


init();
