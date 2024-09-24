class ReloadButton extends HTMLElement {
	connectedCallback() {
		this.shadowRoot.querySelector("button").addEventListener("click", () => {
			window.location.reload();
		});
	}
}

customElements.define("reload-button", ReloadButton);
