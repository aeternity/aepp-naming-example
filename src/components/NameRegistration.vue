<template>
    <div>
        <div id="app-content">
            <div id="app-registration">
                <h2>Aeternity Naming Example</h2>
                <div class="ae-input-wrap">
                    <ae-input v-model="aensName" label="Name" placeholder="name.test">
                        <ae-toolbar slot="footer" v-if="error" fill="red">
                            <span class="ae-error">{{error}}</span>
                        </ae-toolbar>
                    </ae-input>
                </div>
                <div v-if="registrationState" class="ae-cta-loader">
                    <ae-loader class="loader"/>
                    <ae-button face="round" fill="neutral" disabled>{{registrationState}}</ae-button>
                </div>
                <div v-else>
                    <ae-button face="round" fill="primary" @click="registration">Register</ae-button>
                </div>
                <p>Keep in mind, the æternity naming system is in testing mode, so any desired name will have to end in
                    .test and is restricted in which characters are allowed to be used.</p>
                <p>During the registration process three transactions will have to be confirmed, first the pre-claim,
                    then the claim to register the name. Afterwards the name will be updated to point to the account
                    publickey.</p>
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
                    <ae-button face="round" fill="primary" @click="showRegisteredNames">Update Registered Names
                    </ae-button>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
  import { Aepp } from '@aeternity/aepp-sdk'
  import AeInput from '@aeternity/aepp-components/src/components/ae-input/ae-input'
  import { AeButton, mixins, AeLoader, AeToolbar } from '@aeternity/aepp-components'
  import axios from 'axios'

  export default {
    name: 'NameRegistration',
    mixins: [mixins.events],
    components: {
      AeButton,
      AeInput,
      AeLoader,
      AeToolbar
    },
    data () {
      return {
        client: null,
        registrationState: null,
        showUpdating: false,
        aensName: '',
        pub: '',
        names: [],
        error: null
      }
    },
    methods: {
      async showRegisteredNames () {
        this.showUpdating = true
        const nodeInfo = await this.client.getNodeInfo()
        let middlewareUrl = ''
        switch (nodeInfo.nodeNetworkId) {
          case 'ae_uat':
            middlewareUrl = 'https://testnet.mdw.aepps.com/'
            break
          case 'ae_mainnet':
            middlewareUrl = 'https://mdw.aepps.com/'
            break
          default:
            throw Error('Could not parse network Id. Please upgrade your base aepp.')
        }
        const namingAccTxs = await axios.get(`${middlewareUrl}/middleware/transactions/account/${this.pub}`).
          catch(console.error).
          then(res => res.data)
        const nameClaimTxs = namingAccTxs.filter(tx => tx.tx.type === 'NameClaimTx').
          filter(tx => tx.tx.accountId === this.address).
          filter(tx => tx.tx.name)

        this.names = await Promise.all(nameClaimTxs.map(async (tx) => {
          console.log(tx.tx.name)
          const query = await this.client.aensQuery(tx.tx.name)

          return {
            name: tx.tx.name,
            expires: query.ttl,
          }
        }))

        console.log(this.names)
        this.showUpdating = false
      },
      async registration () {
        this.error = null
        if (!this.aensName.endsWith('.test')) {
          return this.error = 'Name has to end with .test'
        }

        this.registrationState = 'Checking if name is available'
        const alreadyRegistered = await this.client.aensQuery(this.aensName).then((name) => {
          console.log(name)
          this.error = `${this.aensName} is already registered.`
          this.registrationState = null
          return true
        }).catch(() => false)
        if (alreadyRegistered) return

        this.registrationState = 'Pre-Claiming Name'
        const preclaim = await this.client.aensPreclaim(this.aensName).catch((e) => {
          console.error(e)
          this.error = `${this.aensName} pre-claiming failed`
          this.registrationState = null
        })

        if (!preclaim) {
          this.registrationState = null
          return
        }

        this.registrationState = 'Claiming Name'
        const claim = await this.client.aensClaim(this.aensName, preclaim.salt, preclaim.height).catch((e) => {
          console.error(e)
          this.error = `${this.aensName} claiming failed`
          this.registrationState = null
        })

        if (!claim) {
          this.registrationState = null
          return
        }

        this.registrationState = 'Updating Name'
        await this.client.aensUpdate(claim.id, this.pub).catch((e) => {
          console.error(e)
          alert(`${this.aensName} updating failed`)
          this.registrationState = null
        })

        this.registrationState = null
        this.aensName = ''
        this.showRegisteredNames()
      },
    },
    created () {
      Aepp().then(ae => {
        this.client = ae
        ae.address().then(address => {
          this.pub = address
          this.showRegisteredNames()
        }).catch(e => {
          this.pub = `Rejected: ${e}`
        })
      })
    },
  }
</script>

<style>
    #app-content {
        padding: 0 20px 20px;
    }

    #app-registration {
        margin-bottom: 20px;
    }

    .ae-loader {
        margin-right: 10px;
    }

    #app-registered-names ul {
        list-style: none;
        padding: 0;
    }
    input.ae-input {
        box-sizing: border-box;
    }

    .ae-error {
        color: red;
    }
    .ae-input-wrap {
        margin-bottom: 1rem;
    }
    .ae-cta-loader {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
</style>
