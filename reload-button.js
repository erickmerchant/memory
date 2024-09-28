class ReloadButton extends HTMLElement {
	connectedCallback() {
		this.addEventListener("click", this);
	}

	handleEvent() {
		window.location.reload();
	}
}

customElements.define("reload-button", ReloadButton);
