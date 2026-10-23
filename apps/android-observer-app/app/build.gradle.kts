plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.youpi.observer"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.youpi.observer"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        // Optional gateway discovery for Cloudflare Quick Tunnels, whose URL changes on every
        // restart. Set to the Firestore REST URL of the document holding the live tunnel, e.g.
        //   ./gradlew assembleDebug -PgatewayDiscoveryUrl=https://firestore.googleapis.com/v1/projects/<id>/databases/(default)/documents/config/gateway
        // Empty (default) disables discovery: the app keeps the URL entered at pairing.
        val discoveryUrl = (project.findProperty("gatewayDiscoveryUrl") as String?) ?: ""
        buildConfigField("String", "GATEWAY_DISCOVERY_URL", "\"$discoveryUrl\"")
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
