const form = document.getElementById("reply-form");
const threadInput = document.getElementById("thread");
const roleSelect = document.getElementById("role");
const toneSelect = document.getElementById("tone");
const modeSelect = document.getElementById("mode");
const newMessageInput = document.getElementById("new-message");
const newMessageLabel = document.getElementById("new-message-label");
const repliesContainer = document.getElementById("replies-container");
const statusDiv = document.getElementById("status");
const generateBtn = document.getElementById("generate-btn");

// Show/hide new message textarea based on mode
modeSelect.addEventListener("change", () => {
  if (modeSelect.value === "analyze" || modeSelect.value === "both") {
    newMessageInput.classList.remove("hidden");
    newMessageLabel.classList.remove("hidden");
    newMessageInput.required = true;
  } else {
    newMessageInput.classList.add("hidden");
    newMessageLabel.classList.add("hidden");
    newMessageInput.required = false;
    newMessageInput.value = "";
  }
});

// Copy button event delegation (added once)
repliesContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("copy-btn")) {
    const btn = e.target;
    const replyCard = btn.closest(".reply-card");
    const replyText = replyCard.innerText.replace("Copy 📋", "").trim();

    try {
      await navigator.clipboard.writeText(replyText);
      btn.textContent = "Copied! 📋";
      setTimeout(() => {
        btn.textContent = "Copy 📋";
      }, 2000);
    } catch {
      btn.textContent = "Failed to copy";
      setTimeout(() => {
        btn.textContent = "Copy 📋";
      }, 2000);
    }
  }
});

function autoResizeTextarea(textarea) {
  textarea.style.height = "auto"; // reset height
  textarea.style.height = textarea.scrollHeight + "px"; // set height based on scrollHeight
}


// For #thread textarea
threadInput.addEventListener("input", () => autoResizeTextarea(threadInput));
// For #new-message textarea
newMessageInput.addEventListener("input", () => autoResizeTextarea(newMessageInput))

autoResizeTextarea(threadInput);
autoResizeTextarea(newMessageInput);

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  repliesContainer.innerHTML = "";
  statusDiv.textContent = "Generating replies... ⏳";
  generateBtn.disabled = true;

  const payload = {
    thread: threadInput.value.trim(),
    role: roleSelect.value,
    tone: toneSelect.value,
    mode: modeSelect.value,
  };

  if (modeSelect.value === "analyze" || modeSelect.value === "both") {
    payload.new_message = newMessageInput.value.trim();
  }

  try {
    const response = await fetch("https://threadwise-ai-backend.onrender.com/generate-replies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      statusDiv.textContent = `❌ Failed to generate replies. Server responded with status ${response.status}.`;
      generateBtn.disabled = false;
      return;
    }

    const data = await response.json();

    let replies = [];

    try {
      if (typeof data.reply === "string") {
        replies = JSON.parse(data.reply);
      } else {
        replies = data.reply;
      }
    } catch {
      replies = [data.reply];
    }

    if (!replies.length) {
      statusDiv.textContent = "No replies generated.";
      generateBtn.disabled = false;
      return;
    }

    statusDiv.textContent = `✅ Generated ${replies.length} reply${replies.length > 1 ? "ies" : "y"}:`;

    repliesContainer.innerHTML = replies
      .map(
        (r) => `
      <div class="reply-card" tabindex="0" role="region" aria-label="Generated reply">
        ${r.replace(/\n/g, "<br>")}
        <button class="copy-btn" aria-label="Copy reply to clipboard">Copy 📋</button>
      </div>`
      )
      .join("");

  } catch (error) {
    console.error(error);
    statusDiv.textContent = "❌ Failed to generate replies. Is the backend running?";
  }

  generateBtn.disabled = false;
});


