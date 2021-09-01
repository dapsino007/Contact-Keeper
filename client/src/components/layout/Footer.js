import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>Copyright ⓒ Contact Keeper {year}</p>
    </footer>
  );
}

export default Footer;
