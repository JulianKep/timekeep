//get handle of top level element
let container = document.getElementById("container");

//global variables
let user_id = "";
let timer_running = false;
let start_time = new Date();
let end_time = new Date();
let time_passed = 1;
const db = window.supabase.createClient(
    "https://ezjzdwtxoufuhrrppspk.supabase.co",
    "sb_publishable_wDCgMIF9jJuHnt4Ur5XU7Q_Tt4ZU7Hn"
);

//function that reloads all functions that create ui elements that need to be updated
function reload_ui(){
    display_times()
}



document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    email = document.getElementById('name').value
    password = document.getElementById('password').value

    const { data, error: loginFehler } = await db.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (loginFehler) return console.error(loginFehler.message);

    user_id = data.user.id;



    container.innerHTML = `
    <h1>TIMER</h1>
        <button id="time-btn">start</button>
        <p id="timer">
            00:00:00
         </p>
    <p id="tags"></p>
    <br/>
    <button id="delete-btn">delete data</button>
    `

    reload_ui();

    document.getElementById("time-btn").addEventListener("click", async () => {

        if (timer_running){
            document.getElementById("time-btn").innerText = "start";

            end_time = new Date();
            clearInterval(interval);

            await speichern();

            reload_ui();

            timer_running = false;
        } else {
            document.getElementById("time-btn").innerText = "end";

            start_time = new Date();
            interval = setInterval(() => {
                document.querySelector("#timer").textContent = `${String(Math.floor(time_passed / 3600)).padStart(2, "0")}:${String(Math.floor(time_passed / 60)).padStart(2, "0")}:${String(time_passed % 60).padStart(2, "0")}`
                time_passed += 1;
            }, 1000);

            timer_running = true;
        }

    })

    document.getElementById("delete-btn").addEventListener("click", async () => {
        await delete_all_data();
        reload_ui();
    });

    document.getElementById("tags").addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            delete_entry(e.target.parentElement.id);
        }
    });

})


async function delete_all_data(){

    const response = await db
        .from("time")
        .delete()
        .eq("user_id", user_id)

    console.log(response.status, response.statusText);
}

async function delete_entry(id){

    const response = await db
        .from("time")
        .delete()
        .eq("id", id)

    console.log(response.status, response.statusText);

    reload_ui();
}



async function speichern() {


    const duration = end_time - start_time;

    const { error } = await db.from("time").insert({
        user_id: user_id,
        start: start_time.toISOString(),
        end: end_time.toISOString(),
        duration: duration,
    });
    console.log(error ? error.message : "saved data");
}



async function display_times(){

    let tags = document.getElementById("tags");

    const { data: zeilen, error } = await db
        .from("time")
        .select("")
        .eq("user_id", user_id)
        .order("start", { ascending: false});

    console.log(error ? error.message : "request okay");

    tags.innerHTML = "";

    let total_duration = 0;

    let dateSet = new Set([]);
    let contidionalHeading = ``

    for (const element of zeilen){
        const start = new Date(element.start)
        const end = new Date(element.end)
        const date = start.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        if(dateSet.has(date)){
            contidionalHeading = ``
        }else{
            dateSet.add(date)
            contidionalHeading = `<span class="date-heading">${date}</span>`
        }

        let dur = end - start;
        total_duration += dur

        dur  = Math.floor(dur / 1000);

        tags.innerHTML += contidionalHeading
        tags.innerHTML += `<span id="${element.id}" class="time-entry"><span>[${String(Math.floor(dur / 3600)).padStart(2, "0")}:${String(Math.floor(dur / 60)).padStart(2, "0")}:${String(dur % 60).padStart(2, "0")}]   `
        + start.toLocaleTimeString("de-DE") + " To " + end.toLocaleTimeString("de-DE") + '</span><button class="del" type="button">delete</button></span>'
    }

    //convert from milliseconds to seconds
    total_duration = Math.floor(total_duration / 1000);

    tags.innerHTML += `Total: <span class="total-number">${String(Math.floor(total_duration / 3600)).padStart(1, "0")}</span> Hours <span class="total-number">${String(Math.floor(total_duration / 60)).padStart(1, "0")}</span> Minutes <span class="total-number">${String(total_duration % 60).padStart(1, "0")}</span> Seconds`
}

