<template>
  <div>
    <ae-banner>
      <h1>Pegæhs Næme Registrætion Stætion</h1>
          <ae-icon style="font-size:75px" name="aeternity" />
    </ae-banner>
    <!-- <div id="app-1">
      <h2>This æternity blockchain aepp allows you to register names.</h2>
    </div> -->
    <div id="app-2">
      <h2 style="text-align:left">Please enter the desired name for registration (e.g. testname.test):</h2>
      <ae-input placeholder="aensName"/><br/>
      <ae-button face="round" fill="primary" @click="registration">Register</ae-button>
      <p>  </p>
      <ae-button face="round" fill="primary" @click="checkName">Show Registred Names</ae-button>
    </div>
    <div id="app-3">
      <ae-label>
        <ul id="names-1">
          <li v-for="tx in nameTxs">
            {{ tx.tx.name }}
          </li>
        </ul>
     </ae-label>
    </div>
</div>
</template>

<script>
import {Aepp} from '@aeternity/aepp-sdk'
import { AeButton, mixins, AeInput, AeHeader, AeIcon, AeLabel, AeBanner } from '@aeternity/aepp-components'
import axios from 'axios'

export default {
  name: 'HelloWorld',
  mixins: [mixins.events],
  components: {
   AeButton,
   AeInput,
   AeHeader,
   AeIcon,
   AeLabel,
   AeBanner
  },
  methods: {
    async checkName () {
      const middlewareUrl = "https://testnet.mdw.aepps.com/";
      const namingAccTxs = await axios.get(`${middlewareUrl}/middleware/transactions/account/${this.pub}`).catch(console.error).then(res => res.data.transactions);
      const filteredNamingTxs = namingAccTxs
        .filter(tx => tx.tx.type === 'NameClaimTx')
        .filter(tx => tx.tx.accountId === this.address)
      this.nameTxs = filteredNamingTxs

    },
    async registration () {
     const query = await this.client.aensQuery(this.aensName).then(()=>true).catch(()=>alert(false));
     console.log(query);

     const preclaim = await this.client.aensPreclaim(this.aensName);
     console.log(preclaim);

     const claim = await this.client.aensClaim(this.aensName, preclaim.salt, preclaim.height);
     console.log(claim);

     const update = await this.client.aensUpdate(claim.id, this.pub);
     console.log(update);
   }

 },
  data() {
    return {
    client: null,
    message: 'Welcome!',
    aensName: '',
    pub: '',
    nameTxs: []
  }},
  created () {
    Aepp().then(ae => {
      this.client = ae
      ae.address()
        .then(address => {
          this.pub = address
        })
        .catch(e => { this.pub = `Rejected: ${e}` })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
