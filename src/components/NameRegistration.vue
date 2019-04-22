<template>
  <div>
    <ae-banner>
      <h1>Pegæhs Næme Registrætion Stætion</h1>
      <ae-icon style="font-size:75px" name="aeternity"/>
    </ae-banner>

    <div id="app-content">

      <div id="app-registration">
        <h2>Please enter the desired name for registration:</h2>
        <ae-input v-model="aensName" placeholder="name.test"/>
        <p>Keep in mind, the æternity naming system is in testing mode, so any desired name will have to end in .test
          and is restricted in which characters are allowed to be used.</p>
        <p>During the registration process three transactions will have to be confirmed, first the pre-claim, then the
          claim to register the name. Afterwards the name will be updated to point to the account publickey.</p>

        <div v-if="registrationState">
          <ae-loader class="loader"/>
          <ae-button face="round" fill="neutral" disabled>{{registrationState}}</ae-button>
        </div>
        <div v-else>
          <ae-button face="round" fill="primary" @click="registration">Register</ae-button>
        </div>

      </div>


      <div id="app-registered-names">
        <h2>Your Registered Names ({{names.length}}):</h2>
        <ul>
          <li v-for="name in names" :key="name.name">
            {{ name.name }} (expires block {{name.expires}})
          </li>
        </ul>

        <div v-if="showUpdating">
          <ae-loader class="loader"/>
          <ae-button face="round" fill="neutral" disabled>Update Registered Names</ae-button>
        </div>
        <div v-else>
          <ae-button face="round" fill="primary" @click="showRegisteredNames">Update Registered Names</ae-button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
    import {Aepp} from '@aeternity/aepp-sdk'
    import {AeButton, mixins, AeInput, AeLoader, AeIcon, AeBanner} from '@aeternity/aepp-components'
    import axios from 'axios'

    export default {
        name: 'HelloWorld',
        mixins: [mixins.events],
        components: {
            AeButton,
            AeInput,
            AeIcon,
            AeLoader,
            AeBanner
        },
        data() {
            return {
                client: null,
                registrationState: null,
                showUpdating: false,
                aensName: '',
                pub: '',
                names: []
            }
        },
        methods: {
            async showRegisteredNames() {
                this.showUpdating = true;
                const middlewareUrl = "https://testnet.mdw.aepps.com/";
                const namingAccTxs = await axios.get(`${middlewareUrl}/middleware/transactions/account/${this.pub}`).catch(console.error).then(res => res.data);
                const nameClaimTxs = namingAccTxs
                    .filter(tx => tx.tx.type === 'NameClaimTx')
                    .filter(tx => tx.tx.accountId === this.address)
                    .filter(tx => tx.tx.name);

                this.names = await Promise.all(nameClaimTxs.map(async (tx) => {
                    console.log(tx.tx.name);
                    const query = await this.client.aensQuery(tx.tx.name);

                    return {
                        name: tx.tx.name,
                        expires: query.ttl
                    }
                }));

                console.log(this.names);
                this.showUpdating = false;
            },
            async registration() {
                if (!this.aensName.endsWith(".test")) {
                    alert("Name has to end with .test");
                    return;
                }

                this.registrationState = "Checking if name is available";
                const alreadyRegistered = await this.client.aensQuery(this.aensName).then((name) => {
                    console.log(name);
                    alert(`${this.aensName} is already registered.`);
                    this.registrationState = null;
                    return true;
                }).catch(() => false);
                if (alreadyRegistered) return;

                this.registrationState = "Pre-Claiming Name";
                const preclaim = await this.client.aensPreclaim(this.aensName).catch((e) => {
                    console.error(e);
                    alert(`${this.aensName} pre-claiming failed`);
                    this.registrationState = null;
                });

                if (!preclaim) {
                    this.registrationState = null;
                    return;
                }

                this.registrationState = "Claiming Name";
                const claim = await this.client.aensClaim(this.aensName, preclaim.salt, preclaim.height).catch((e) => {
                    console.error(e);
                    alert(`${this.aensName} claiming failed`);
                    this.registrationState = null;
                });

                if (!claim) {
                    this.registrationState = null;
                    return;
                }

                this.registrationState = "Updating Name";
                await this.client.aensUpdate(claim.id, this.pub).catch((e) => {
                    console.error(e);
                    alert(`${this.aensName} updating failed`);
                    this.registrationState = null;
                });

                this.registrationState = null;
                this.aensName = '';
                this.showRegisteredNames();
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

  .ae-loader {
    margin-right: 10px;
  }

  #app-registered-names ul {
    list-style: none;
    padding: 0px;
  }
</style>
