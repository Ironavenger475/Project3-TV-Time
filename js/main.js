window.onload = () => {
    showPopup();
    createTabs(tabs, renderPlaceholder);
  };
  
  const overlay = document.getElementById("overlay");
  const continueBtn = document.getElementById("continueBtn");
  const reopenPopupBtn = document.getElementById("reopenPopupBtn");
  
  function showPopup() {
    overlay.classList.remove("hidden");
  }
  
  function hidePopup() {
    overlay.classList.add("hidden");
  }
  
  continueBtn.addEventListener("click", hidePopup);
  reopenPopupBtn.addEventListener("click", showPopup);

  

  
