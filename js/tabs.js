// ref: https://www.w3schools.com/howto/howto_js_tabs.asp
function openTab(evt, tabName) {
  // Hide all tab content
  let tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove class "active" from all tablinks buttons
  tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace("active", "");
  }

  // Show the selected tab by adding the "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "table";
  evt.currentTarget.className += "active";
}
