<script>
import userManager, { isLoggedIn } from '@/utils/userManager.js'

export default {
	onLaunch: function() {
		console.log('App Launch - 记意 Parli')
		this.checkLoginStatus()
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	},
	methods: {
		checkLoginStatus() {
			// 检查是否已登录
			if (!isLoggedIn()) {
				console.log('用户未登录，保持当前状态（可使用游客模式）')
				// 注意：不强制跳转到登录页，允许游客模式使用
				// 用户可以在profile页面选择登录
			} else {
				const currentUser = userManager.getCurrentUser()
				console.log('用户已登录:', currentUser.username)
			}
		}
	}
}
</script>

<style>
	/*每个页面公共css */
</style>
