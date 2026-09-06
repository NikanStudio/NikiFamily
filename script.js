/* ==================================================
   NIKI FAMILY
   اتصال به Supabase
   ================================================== */

const SUPABASE_URL =
    "https://jjoxrvcstonuzvfutcbl.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_P2aV9jQxA9rTqkeXHdu23w_s5-HbjyC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ==================================================
   متغیرهای اصلی
   ================================================== */

let topics = [];
let currentTopicId = null;


/* ==================================================
   دریافت تمام تاپیک‌ها
   ================================================== */

async function loadTopics() {

    const { data, error } =
        await supabaseClient
            .from("topic")
            .select("*")
            .order("created_at", {
                ascending: true
            });

    if (error) {

        console.error(
            "Topics error:",
            error
        );

        const container =
            document.getElementById("topics");

        if (container) {

            container.innerHTML = `
                <div class="empty">
                    دریافت تاپیک‌ها با مشکل مواجه شد.
                    <br><br>
                    لطفاً دوباره تلاش کنید.
                </div>
            `;
        }

        return;
    }

    topics = data || [];

    await displayTopics(topics);
}


/* ==================================================
   تعداد پاسخ‌های یک تاپیک
   ================================================== */

async function getReplyCount(topicId) {

    const { count, error } =
        await supabaseClient
            .from("replies")
            .select("id", {
                count: "exact",
                head: true
            })
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


/* ==================================================
   نمایش تاپیک‌ها
   ================================================== */

async function displayTopics(list = topics) {

    const container =
        document.getElementById("topics");

    const countElement =
        document.getElementById("topicCount");


    if (!container) {
        return;
    }


    if (countElement) {

        countElement.textContent =
            list.length + " تاپیک";
    }


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


    /* جدیدترین تاپیک‌ها اول */

    const reversed =
        [...list].reverse();


    for (const topic of reversed) {

        const replyCount =
            await getReplyCount(topic.id);


        const div =
            document.createElement("div");

        div.className = "topic";


        div.onclick = function () {

            openTopic(topic.id);

        };


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
                text.substring(0, 120)
            );


        div.innerHTML = `

            <h3>
                ${title}
            </h3>

            <div class="topic-info">

                توسط ${username}

                • ${formatDate(
                    topic.created_at
                )}

                • ${replyCount} پاسخ

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


        container.appendChild(div);
    }
}


/* ==================================================
   باز کردن فرم ساخت تاپیک
   ================================================== */

function openTopicForm() {

    const modal =
        document.getElementById(
            "topicModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "block";


    const username =
        document.getElementById(
            "username"
        );


    const title =
        document.getElementById(
            "topicTitle"
        );


    const text =
        document.getElementById(
            "topicText"
        );


    if (username) {
        username.value = "";
    }


    if (title) {
        title.value = "";
    }


    if (text) {
        text.value = "";
    }
}


/* ==================================================
   بستن فرم ساخت تاپیک
   ================================================== */

function closeTopicForm() {

    const modal =
        document.getElementById(
            "topicModal"
        );


    if (modal) {

        modal.style.display =
            "none";
    }
}


/* ==================================================
   ساخت تاپیک جدید
   ================================================== */

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


    /* بررسی خالی نبودن */

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


    /* محدودیت نام */

    if (
        username.length > 50
    ) {

        alert(
            "نام شما نباید بیشتر از ۵۰ کاراکتر باشد."
        );

        return;
    }


    /* محدودیت عنوان */

    if (
        title.length > 150
    ) {

        alert(
            "عنوان تاپیک نباید بیشتر از ۱۵۰ کاراکتر باشد."
        );

        return;
    }


    /* ارسال به Supabase */

    const { data, error } =
        await supabaseClient
            .from("topic")
            .insert({

                title: title,

                text: text,

                username: username

            })
            .select();


    if (error) {

        console.error(
            "Create topic error:",
            error
        );


        alert(
            "ساخت تاپیک انجام نشد.\n\n" +
            "خطای Supabase:\n" +
            error.message
        );

        return;
    }


    console.log(
        "Topic created:",
        data
    );


    /* پاک کردن فرم */

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


    /* دریافت دوباره تاپیک‌ها */

    await loadTopics();


    alert(
        "تاپیک با موفقیت ساخته شد 💜"
    );
}


/* ==================================================
   باز کردن یک تاپیک
   ================================================== */

async function openTopic(id) {

    currentTopicId = id;


    const topic =
        topics.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!topic) {

        return;
    }


    const content =
        document.getElementById(
            "topicContent"
        );


    if (!content) {

        return;
    }


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


    const modal =
        document.getElementById(
            "topicView"
        );


    if (modal) {

        modal.style.display =
            "block";
    }


    const replyName =
        document.getElementById(
            "replyName"
        );


    const replyText =
        document.getElementById(
            "replyText"
        );


    if (replyName) {

        replyName.value = "";
    }


    if (replyText) {

        replyText.value = "";
    }


    await loadReplies(id);
}


/* ==================================================
   دریافت پاسخ‌های یک تاپیک
   ================================================== */

async function loadReplies(topicId) {

    const container =
        document.getElementById(
            "repliesContainer"
        );


    if (!container) {

        return;
    }


    const { data, error } =
        await supabaseClient
            .from("replies")
            .select("*")
            .eq(
                "topic_id",
                topicId
            )
            .order("created_at", {
                ascending: true
            });


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


    /* هیچ پاسخی وجود ندارد */

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
                    margin:15px 0;
                "
            >
                هنوز کسی پاسخ نداده است.
            </p>

        `;

        return;
    }


    let html =
        "<h3>پاسخ‌ها</h3>";


    data.forEach(
        function (reply) {

            html += `

                <div class="reply">

                    <strong>

                        ${escapeHTML(
                            reply.username ||
                            "ناشناس"
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


/* ==================================================
   بستن صفحه تاپیک
   ================================================== */

function closeTopic() {

    const modal =
        document.getElementById(
            "topicView"
        );


    if (modal) {

        modal.style.display =
            "none";
    }


    currentTopicId =
        null;
}


/* ==================================================
   ارسال پاسخ
   ================================================== */

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


    /* بررسی خالی نبودن */

    if (
        !name ||
        !text
    ) {

        alert(
            "لطفاً نام و پاسخ را وارد کنید."
        );

        return;
    }


    /* محدودیت نام */

    if (
        name.length > 50
    ) {

        alert(
            "نام شما نباید بیشتر از ۵۰ کاراکتر باشد."
        );

        return;
    }


    /* محدودیت پاسخ */

    if (
        text.length > 2000
    ) {

        alert(
            "پاسخ نباید بیشتر از ۲۰۰۰ کاراکتر باشد."
        );

        return;
    }


    /* ارسال پاسخ */

    const { data, error } =
        await supabaseClient
            .from("replies")
            .insert({

                topic_id:
                    currentTopicId,

                username:
                    name,

                text:
                    text

            })
            .select();


    if (error) {

        console.error(
            "Reply error:",
            error
        );


        alert(
            "ارسال پاسخ انجام نشد.\n\n" +
            "خطای Supabase:\n" +
            error.message
        );

        return;
    }


    console.log(
        "Reply created:",
        data
    );


    /* پاک کردن فرم */

    document.getElementById(
        "replyName"
    ).value = "";


    document.getElementById(
        "replyText"
    ).value = "";


    /* دریافت دوباره پاسخ‌ها */

    await loadReplies(
        currentTopicId
    );


    /* به‌روزرسانی تعداد پاسخ‌ها */

    await loadTopics();


    alert(
        "پاسخ با موفقیت ارسال شد 💜"
    );
}


/* ==================================================
   جستجوی تاپیک‌ها
   ================================================== */

async function searchTopics() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {

        return;
    }


    const query =
        input.value
            .toLowerCase()
            .trim();


    /* اگر چیزی نوشته نشده */

    if (!query) {

        await displayTopics(
            topics
        );

        return;
    }


    const result =
        topics.filter(
            function (topic) {

                const title =
                    String(
                        topic.title || ""
                    ).toLowerCase();


                const text =
                    String(
                        topic.text || ""
                    ).toLowerCase();


                const username =
                    String(
                        topic.username || ""
                    ).toLowerCase();


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


/* ==================================================
   فرمت تاریخ
   ================================================== */

function formatDate(date) {

    if (!date) {

        return "";
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "";
    }


    return parsedDate.toLocaleDateString(
        "fa-IR"
    );
}


/* ==================================================
   جلوگیری از HTML Injection
   ================================================== */

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


/* ==================================================
   بستن Modal با کلیک بیرون
   ================================================== */

window.addEventListener(
    "click",
    function (event) {

        const topicModal =
            document.getElementById(
                "topicModal"
            );


        const topicView =
            document.getElementById(
                "topicView"
            );


        if (
            topicModal &&
            event.target === topicModal
        ) {

            closeTopicForm();
        }


        if (
            topicView &&
            event.target === topicView
        ) {

            closeTopic();
        }

    }
);


/* ==================================================
   شروع سایت
   ================================================== */

async function init() {

    console.log(
        "Niki Family starting..."
    );


    await loadTopics();

}


/* اجرای سایت */

init();
