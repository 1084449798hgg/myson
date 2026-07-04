<template>
  <div class="earth-container">
    <div class="earth-header">
      <div class="header-left">
        <span class="back-btn" @click="goBack">← 返回</span>
      </div>
      <div class="header-center">
        <h1>三维地球展示</h1>
        <p class="subtitle">Three.js + Vue 2 实时渲染</p>
      </div>
      <div class="header-right"></div>
    </div>
    <div ref="earthContainer" class="earth-wrapper"></div>

    <div class="control-panel">
      <div class="control-group">
        <label class="control-label">自动旋转</label>
        <input type="checkbox" v-model="autoRotate" class="control-checkbox" />
      </div>
      <div class="control-group">
        <label class="control-label">旋转速度</label>
        <input
          type="range"
          v-model="rotateSpeed"
          min="0"
          max="10"
          step="0.5"
          class="control-slider"
        />
        <span class="control-value">{{ rotateSpeed }}</span>
      </div>
      <div class="control-group">
        <label class="control-label">云层显示</label>
        <input type="checkbox" v-model="showClouds" class="control-checkbox" />
      </div>
      <div class="control-group">
        <label class="control-label">大气光晕</label>
        <input type="checkbox" v-model="showAtmosphere" class="control-checkbox" />
      </div>
      <div class="info-panel">
        <div class="info-item"><span class="info-dot green"></span>地球纹理：512x256</div>
        <div class="info-item"><span class="info-dot blue"></span>支持鼠标拖拽旋转</div>
        <div class="info-item"><span class="info-dot orange"></span>滚轮缩放距离</div>
      </div>
    </div>

    <div class="loading" v-if="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default {
  name: 'Earth3D',
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      earth: null,
      clouds: null,
      atmosphere: null,
      controls: null,
      animationId: null,
      loading: true,
      autoRotate: true,
      rotateSpeed: 2,
      showClouds: true,
      showAtmosphere: true
    }
  },
  watch: {
    autoRotate() {
      if (this.controls) {
        this.controls.autoRotate = this.autoRotate
      }
    },
    rotateSpeed() {
      if (this.controls) {
        this.controls.autoRotateSpeed = this.rotateSpeed
      }
    },
    showClouds() {
      if (this.clouds) {
        this.clouds.visible = this.showClouds
      }
    },
    showAtmosphere() {
      if (this.atmosphere) {
        this.atmosphere.visible = this.showAtmosphere
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initThree()
    })
  },
  beforeDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    if (this.renderer) {
      this.renderer.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },
    loadEarthTexture() {
      return new Promise((resolve) => {
        const loader = new THREE.TextureLoader()
        const textureUrl = 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg'
        loader.load(textureUrl, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          resolve(texture)
        }, undefined, () => {
          resolve(this.createFallbackTexture())
        })
      })
    },
    loadCloudTexture() {
      return new Promise((resolve) => {
        const loader = new THREE.TextureLoader()
        const textureUrl = 'https://threejs.org/examples/textures/clouds_2048.png'
        loader.load(textureUrl, (texture) => {
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          resolve(texture)
        }, undefined, () => {
          resolve(this.createFallbackCloudTexture())
        })
      })
    },
    createFallbackTexture() {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 512
      const ctx = canvas.getContext('2d')

      const oceanGradient = ctx.createLinearGradient(0, 0, 0, 512)
      oceanGradient.addColorStop(0, '#1a3a5c')
      oceanGradient.addColorStop(0.3, '#2a5d8f')
      oceanGradient.addColorStop(0.5, '#3a7ab5')
      oceanGradient.addColorStop(0.7, '#2a5d8f')
      oceanGradient.addColorStop(1, '#1a3a5c')
      ctx.fillStyle = oceanGradient
      ctx.fillRect(0, 0, 1024, 512)

      const continents = [
        { x: 150, y: 150, r: 120, color: '#2d6e3e' },
        { x: 300, y: 200, r: 90, color: '#3a8a4e' },
        { x: 500, y: 180, r: 100, color: '#2d6e3e' },
        { x: 700, y: 160, r: 110, color: '#3a8a4e' },
        { x: 850, y: 200, r: 70, color: '#2d6e3e' },
        { x: 200, y: 350, r: 80, color: '#3a8a4e' },
        { x: 450, y: 380, r: 60, color: '#2d6e3e' },
        { x: 600, y: 350, r: 90, color: '#3a8a4e' },
        { x: 820, y: 380, r: 50, color: '#2d6e3e' },
        { x: 380, y: 100, r: 50, color: '#4a9a5e' },
        { x: 650, y: 280, r: 40, color: '#4a9a5e' }
      ]

      continents.forEach(c => {
        ctx.fillStyle = c.color
        ctx.beginPath()
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
        ctx.fill()
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20
          const radius = c.r + (Math.random() - 0.5) * 40
          const x = c.x + Math.cos(angle) * radius
          const y = c.y + Math.sin(angle) * radius
          ctx.beginPath()
          ctx.arc(x, y, 15 + Math.random() * 20, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      const polarGradient = ctx.createLinearGradient(0, 0, 0, 50)
      polarGradient.addColorStop(0, '#ffffff')
      polarGradient.addColorStop(1, '#e0eef5')
      ctx.fillStyle = polarGradient
      ctx.fillRect(0, 0, 1024, 40)

      const polarGradient2 = ctx.createLinearGradient(0, 472, 0, 512)
      polarGradient2.addColorStop(0, '#e0eef5')
      polarGradient2.addColorStop(1, '#ffffff')
      ctx.fillStyle = polarGradient2
      ctx.fillRect(0, 472, 1024, 40)

      ctx.fillStyle = '#c9a96e'
      ctx.beginPath()
      ctx.arc(520, 220, 35, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(250, 230, 25, 0, Math.PI * 2)
      ctx.fill()

      for (let i = 0; i < 500; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 512
        const r = Math.random() * 3
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.1})`
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      return texture
    },
    createFallbackCloudTexture() {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 512
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = 'rgba(0,0,0,0)'
      ctx.fillRect(0, 0, 1024, 512)

      for (let i = 0; i < 80; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 512
        const r = 20 + Math.random() * 60
        const opacity = 0.3 + Math.random() * 0.5

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
        gradient.addColorStop(0, `rgba(255,255,255,${opacity})`)
        gradient.addColorStop(0.5, `rgba(255,255,255,${opacity * 0.5})`)
        gradient.addColorStop(1, 'rgba(255,255,255,0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      const texture = new THREE.CanvasTexture(canvas)
      return texture
    },
    async initThree() {
      const container = this.$refs.earthContainer
      const width = container.clientWidth
      const height = container.clientHeight

      // 场景
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x000011)

      // 相机
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
      this.camera.position.set(0, 0, 15)

      // 渲染器
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.setSize(width, height)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      container.appendChild(this.renderer.domElement)

      // 控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      this.controls.rotateSpeed = 0.5
      this.controls.minDistance = 5
      this.controls.maxDistance = 30
      this.controls.autoRotate = this.autoRotate
      this.controls.autoRotateSpeed = this.rotateSpeed

      // 光照
      const ambientLight = new THREE.AmbientLight(0x333355, 0.6)
      this.scene.add(ambientLight)

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
      sunLight.position.set(10, 5, 10)
      this.scene.add(sunLight)

      // 星空背景
      this.createStarField()

      // 创建大气光晕
      this.createAtmosphere()

      // 异步加载纹理
      const [earthTexture, cloudTexture] = await Promise.all([
        this.loadEarthTexture(),
        this.loadCloudTexture()
      ])

      // 创建地球
      const earthGeometry = new THREE.SphereGeometry(5, 64, 64)
      const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        shininess: 10,
        specular: new THREE.Color(0x222222)
      })
      this.earth = new THREE.Mesh(earthGeometry, earthMaterial)
      this.scene.add(this.earth)

      // 创建云层
      const cloudGeometry = new THREE.SphereGeometry(5.15, 64, 64)
      const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      })
      this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial)
      this.scene.add(this.clouds)

      this.loading = false
      this.animate()

      window.addEventListener('resize', this.handleResize)
    },
    createStarField() {
      const starGeometry = new THREE.BufferGeometry()
      const starCount = 3000
      const positions = new Float32Array(starCount * 3)
      const colors = new Float32Array(starCount * 3)

      for (let i = 0; i < starCount; i++) {
        const radius = 100 + Math.random() * 400
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos((Math.random() - 0.5) * 2)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)

        const intensity = 0.5 + Math.random() * 0.5
        colors[i * 3] = intensity
        colors[i * 3 + 1] = intensity
        colors[i * 3 + 2] = intensity * (0.8 + Math.random() * 0.2)
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const starMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
      })

      const stars = new THREE.Points(starGeometry, starMaterial)
      this.scene.add(stars)
    },
    createAtmosphere() {
      const atmosphereGeometry = new THREE.SphereGeometry(5.5, 64, 64)
      const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
      })
      this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
      this.scene.add(this.atmosphere)
    },
    animate() {
      this.animationId = requestAnimationFrame(this.animate)

      // 云层独立旋转
      if (this.clouds && this.showClouds) {
        this.clouds.rotation.y += 0.0008
      }

      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },
    handleResize() {
      if (!this.$refs.earthContainer) return
      const width = this.$refs.earthContainer.clientWidth
      const height = this.$refs.earthContainer.clientHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    }
  }
}
</script>

<style scoped>
.earth-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000011;
  position: relative;
  overflow: hidden;
}

.earth-header {
  display: flex;
  align-items: center;
  padding: 15px 30px;
  background: linear-gradient(135deg, #0a1a3a 0%, #0d2a5a 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.header-left,
.header-right {
  flex: 1;
  min-width: 80px;
}

.header-center {
  flex: 2;
  text-align: center;
}

.back-btn {
  cursor: pointer;
  font-size: 14px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: background 0.2s;
  display: inline-block;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.earth-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 0 20px rgba(100, 150, 255, 0.6);
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  opacity: 0.8;
}

.earth-wrapper {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.control-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(10, 20, 40, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 150, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  min-width: 220px;
  z-index: 10;
  color: #fff;
}

.control-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 13px;
}

.control-label {
  color: #aabbe0;
}

.control-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4a8eff;
}

.control-slider {
  width: 100px;
  cursor: pointer;
  accent-color: #4a8eff;
}

.control-value {
  color: #4a8eff;
  font-weight: bold;
  min-width: 24px;
  text-align: right;
}

.info-panel {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(100, 150, 255, 0.2);
}

.info-item {
  font-size: 12px;
  color: #8899bb;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.info-dot.green {
  background: #4ade80;
}

.info-dot.blue {
  background: #60a5fa;
}

.info-dot.orange {
  background: #fb923c;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  z-index: 20;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(100, 150, 255, 0.3);
  border-top-color: #4a8eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
