const userToken = localStorage.getItem("taskToken");

if (!userToken || userToken === "") {
  location.replace("/");
}
