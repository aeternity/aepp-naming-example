<template>
  <div>
    <ae-banner>
      <h1>Pegæhs Næme Registrætion Stætion</h1>
      <ae-icon style="font-size:75px" name="aeternity"/>
    </ae-banner>
    <!-- <div id="app-1">
      <h2>This æternity blockchain aepp allows you to register names.</h2>
    </div> -->
    <div id="app-content">
      <div id="app-registration">
        <h2>Please enter the desired name for registration:</h2>
        <ae-input v-model="aensName" placeholder="name.test"/>
        <p>Keep in mind, the æternity naming system is in testing mode, so any desired name will have to end in .test
          and is restricted in which characters are allowed to be used.</p>
        <ae-button face="round" fill="primary" @click="registration">Register</ae-button>
      </div>
      <div id="app-registered-names">
        <h2>Your Registered Names:</h2>
        <ul>
          <li v-for="tx in nameTxs" :key="tx.hash">
            {{ tx.tx.name }}
          </li>
        </ul>
        <ae-button face="round" fill="primary" @click="showRegisteredNames">Update Registered Names</ae-button>
      </div>
    </div>
  </div>
</template>

<script>
    import {Aepp} from '@aeternity/aepp-sdk'
    import {AeButton, mixins, AeInput, AeIcon, AeBanner} from '@aeternity/aepp-components'
    import axios from 'axios'

    export default {
        name: 'HelloWorld',
        mixins: [mixins.events],
        components: {
            AeButton,
            AeInput,
            AeIcon,
            AeBanner
        },
        data() {
            return {
                client: null,
                message: 'Welcome!',
                aensName: '',
                pub: '',
                nameTxs: []
            }
        },
        methods: {
            async showRegisteredNames() {
                const middlewareUrl = "https://testnet.mdw.aepps.com/";
                const namingAccTxs = await axios.get(`${middlewareUrl}/middleware/transactions/account/${this.pub}`).catch(console.error).then(res => res.data);
                this.nameTxs = namingAccTxs
                    .filter(tx => tx.tx.type === 'NameClaimTx')
                    .filter(tx => tx.tx.accountId === this.address);
            },
            async registration() {
                const query = await this.client.aensQuery(this.aensName).then(() => true).catch(() => false);
                console.log(query);

                const preclaim = await this.client.aensPreclaim(this.aensName);
                console.log(preclaim);

                const claim = await this.client.aensClaim(this.aensName, preclaim.salt, preclaim.height);
                console.log(claim);

                const update = await this.client.aensUpdate(claim.id, this.pub);
                console.log(update);
            }
        },
        created() {
            Aepp().then(ae => {
                this.client = ae;
                ae.address()
                    .then(address => {
                        this.pub = address;
                        this.showRegisteredNames();
                    })
                    .catch(e => {
                        this.pub = `Rejected: ${e}`
                    })
            })
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #app-content {
    padding: 20px;
  }

  #app-registration {
    margin-bottom: 20px;
  }

  #app-registered-names ul {
    list-style: none;
    padding: 0px;
  }
</style>
