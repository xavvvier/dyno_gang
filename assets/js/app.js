// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html"
import {Game} from "./game";
import {keyboard} from './keyboard'

var vueApp = new Vue({
  el: '#userInput',
  data: {
    characters: ['virtualguy', 'pinkman', 'ninjafrog', 'maskdude'],
    selected: 'virtualguy',
    username: '',
    visible: true,
    error: '',
  },
  created: function () {
    this.username = this.storeNameOrUuid();
    (this.up = keyboard('ArrowUp')), (this.down = keyboard('ArrowDown'));
    this.up.press = () => {
      this.selectPrevious();
    };
    this.down.press = () => {
      this.selectNext();
    };
  },
  methods: {
    storeNameOrUuid: function () {
      let storedName = localStorage.getItem('username');
      if (storedName) return storedName;
      return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    validate() {
      this.error = '';
      if (this.username.trim() == '') {
        this.error = 'Invalid name';
        return;
      }
      let csrf = document.querySelector("meta[name='csrf-token']").content;
      let config = { headers: { 'x-csrf-token': csrf } };
      axios
        .post('validate', { username: this.username }, config)
        .then((response) => {
          if (response.data.valid) {
            window.userToken = response.data.token;
            this.visible = false;
            new Game(
              document.getElementById('game'),
              { width: 640, height: 480 },
              this.username,
              this.selected
            );
            localStorage.setItem('username', this.username);
            this.up.unsubscribe();
            this.down.unsubscribe();
          } else {
            this.error = response.data.error;
          }
        })
        .catch((err) => {
          //If the csrf token is expired, a refresh might help
          if (err.response.status == 403) {
            window.location.reload(true);
          }
        });
    },
    selectPrevious() {
      let selectedIndex = this.characters.indexOf(this.selected) - 1;
      this.selected =
        this.characters[selectedIndex == -1 ? this.characters.length - 1 : selectedIndex];
    },
    selectNext() {
      let selectedIndex = this.characters.indexOf(this.selected);
      this.selected = this.characters[(selectedIndex + 1) % this.characters.length];
    },
  },
});
