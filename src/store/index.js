import { createStore } from 'vuex'
import router from '../router'
import { auth, db } from '../firebase'
import { collection, addDoc } from "firebase/firestore"; 
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut 
} from 'firebase/auth'

export default createStore({
  state: {
    user: null,
    id:null,
    tours: null
  },
  mutations: {

    SET_USER (state, user) {
      state.user = user
    },
    SET_ID (state, id) {
      state.user = id
    },
    CLEAR_USER (state) {
      state.user = null
    }

  },
  actions: {
    async login ({ commit }, details) {
      const { email, password } = details

      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (error) {
        switch(error.code) {
          case 'auth/user-not-found':
            alert("User not found")
            break
          case 'auth/wrong-password':
            alert("Wrong password")
            break
          default:
            alert("Something went wrong")
        }

        return
      }

      commit('SET_USER', auth.currentUser)
      alert('Logged in Successfully Welcome to the Safari Adventures!!!')
      router.push('/')
    },

    async register ({ commit}, details) {
       const { email, password, displayName } = details
      try {
        await createUserWithEmailAndPassword(auth, email, password)
        updateProfile(auth.currentUser, {displayName})
      } catch (error) {
        switch(error.code) {
          case 'auth/email-already-in-use':
            alert("Email already in use")
            break
          case 'auth/invalid-email':
            alert("Invalid email")
            break
          case 'auth/operation-not-allowed':
            alert("Operation not allowed")
            break
          case 'auth/weak-password':
            alert("Weak password")
            break
          default:
            alert("Something went wrong")
        }
        return
      }
      commit('SET_USER', auth.currentUser)
      alert('You are successfully registered as an Agent!!!')
      router.push('/')
    },

    async createPackage ({ commit}, details) {
      var agentName = '';
      var agentEmail = '';
      var uniqueKey = (Math.random() ).toString(36).substring(5);
      if(this.state.user){
       agentName = this.state.user.displayName;
       agentEmail = this.state.user.email;
      }
      const {packageName,price, description, duration,destination,agentNumber} = details
      console.log('USer:  ', this.state.user); 
      console.log('packageName, duration: ', details); 
      try {
        const docRef = await addDoc(collection(db, "tours"), {
          packageName: packageName,
          price: price,
          description: description,
          duration: duration,
          destination: destination,
          agentName: agentName,
          agentNumber:agentNumber,
          agentEmail:agentEmail,
          uniqueKey:uniqueKey,
        });
        alert('New Tour Package has been created!!!')
        commit('SET_ID', docRef.id)
      } catch (e) {
        console.error("Error adding document: ", e);
      }
      router.push('/')
    },


       

    async logout ({ commit }) {
      await signOut(auth)

      commit('CLEAR_USER')

      router.push('/login')
    },

    // fetchUser ({ commit }) {
    //   auth.onAuthStateChanged(async user => {
    //     if (user === null) {
    //       commit('CLEAR_USER')
    //     } else {
    //       commit('SET_USER', user)

    //       if (router.isReady() && router.currentRoute.value.path === '/login') {
    //         router.push('/')
    //       }
    //     }
    //   })
    // }
    
  }
})