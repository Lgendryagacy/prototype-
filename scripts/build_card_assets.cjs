const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. CHAIR WITH "JOB OPPORTUNITY" SIGN
const chairSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" fill="none">
  <defs>
    <!-- Soft Podium / Ground Shadow -->
    <radialGradient id="chairPodiumGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.32" />
      <stop offset="50%" stop-color="#60A5FA" stop-opacity="0.14" />
      <stop offset="85%" stop-color="#93C5FD" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#DBEAFE" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="podiumDisk" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#EFF6FF" />
      <stop offset="70%" stop-color="#DBEAFE" />
      <stop offset="100%" stop-color="#BFDBFE" />
    </radialGradient>

    <!-- Blue Leather Gradients -->
    <linearGradient id="chairBackBlue" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="25%" stop-color="#0284C7" />
      <stop offset="65%" stop-color="#0052FF" />
      <stop offset="100%" stop-color="#1E40AF" />
    </linearGradient>
    <linearGradient id="chairCushionBlue" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="40%" stop-color="#2563EB" />
      <stop offset="90%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#1E3A8A" />
    </linearGradient>
    <linearGradient id="chairSeatRim" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1E3A8A" />
    </linearGradient>

    <!-- Metallic & Plastic Materials -->
    <linearGradient id="chromeMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="35%" stop-color="#CBD5E1" />
      <stop offset="65%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="chairBaseDark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>

    <!-- Hanging Purple Sign -->
    <linearGradient id="purpleSignGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="30%" stop-color="#8B5CF6" />
      <stop offset="75%" stop-color="#6D28D9" />
      <stop offset="100%" stop-color="#4C1D95" />
    </linearGradient>
    <linearGradient id="cordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="50%" stop-color="#9333EA" />
      <stop offset="100%" stop-color="#581C87" />
    </linearGradient>

    <!-- Dynamic Swoosh Gradient -->
    <linearGradient id="swooshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#0052FF" />
    </linearGradient>

    <!-- Filter Shadows -->
    <filter id="chairShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#0052FF" flood-opacity="0.22" />
    </filter>
    <filter id="signShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#4C1D95" flood-opacity="0.45" />
    </filter>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#3B0764" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- 3D Soft Podium Floor Base -->
  <ellipse cx="250" cy="440" rx="190" ry="46" fill="url(#chairPodiumGrad)" />
  <ellipse cx="250" cy="432" rx="150" ry="34" fill="url(#podiumDisk)" stroke="#DBEAFE" stroke-width="2" />

  <!-- 3 Blue Dynamic Accent Swooshes (Top-Left) -->
  <g opacity="0.95">
    <!-- Swoosh 1 (left) -->
    <path d="M 125 155 Q 115 168 110 185" stroke="url(#swooshGrad)" stroke-width="7" stroke-linecap="round" />
    <!-- Swoosh 2 (mid) -->
    <path d="M 148 140 Q 146 156 142 172" stroke="url(#swooshGrad)" stroke-width="7" stroke-linecap="round" />
    <!-- Swoosh 3 (right) -->
    <path d="M 172 135 Q 176 150 177 165" stroke="url(#swooshGrad)" stroke-width="7" stroke-linecap="round" />
  </g>

  <!-- CHAIR GROUP WITH 3D PERSPECTIVE -->
  <g filter="url(#chairShadow)">
    
    <!-- Wheeled Caster Legs (5-star base) -->
    <g>
      <!-- Base Hub -->
      <ellipse cx="250" cy="420" rx="20" ry="10" fill="url(#chairBaseDark)" />
      <!-- Center Cylinder Stem -->
      <path d="M 244 380 L 256 380 L 255 420 L 245 420 Z" fill="url(#chromeMetal)" />
      <ellipse cx="250" cy="380" rx="7" ry="3" fill="#E2E8F0" />

      <!-- Leg 1 (Center Front) -->
      <path d="M 247 419 L 245 448 L 255 448 L 253 419 Z" fill="url(#chairBaseDark)" />
      <ellipse cx="250" cy="452" rx="8" ry="6" fill="#0F172A" />
      <ellipse cx="250" cy="450" rx="5" ry="3.5" fill="#3B82F6" opacity="0.8" />

      <!-- Leg 2 (Left Front) -->
      <path d="M 245 419 L 180 435 L 182 443 L 247 423 Z" fill="url(#chairBaseDark)" />
      <ellipse cx="178" cy="442" rx="8" ry="6" fill="#0F172A" />
      <ellipse cx="178" cy="440" rx="5" ry="3.5" fill="#3B82F6" opacity="0.8" />

      <!-- Leg 3 (Right Front) -->
      <path d="M 255 419 L 320 435 L 318 443 L 253 423 Z" fill="url(#chairBaseDark)" />
      <ellipse cx="322" cy="442" rx="8" ry="6" fill="#0F172A" />
      <ellipse cx="322" cy="440" rx="5" ry="3.5" fill="#3B82F6" opacity="0.8" />

      <!-- Leg 4 (Left Rear) -->
      <path d="M 246 418 L 198 410 L 200 405 L 248 415 Z" fill="#1E293B" />
      <ellipse cx="196" cy="409" rx="7" ry="5" fill="#0F172A" />

      <!-- Leg 5 (Right Rear) -->
      <path d="M 254 418 L 302 410 L 300 405 L 252 415 Z" fill="#1E293B" />
      <ellipse cx="304" cy="409" rx="7" ry="5" fill="#0F172A" />
    </g>

    <!-- Under-Seat Chassis & Chrome Support -->
    <path d="M 215 365 Q 250 375 285 365 L 282 382 Q 250 388 218 382 Z" fill="url(#chairBaseDark)" />
    <path d="M 288 330 Q 295 360 286 375 L 278 372 Q 286 355 280 330 Z" fill="url(#chromeMetal)" />

    <!-- Blue Padded Seat Cushion -->
    <!-- Base Bottom Thickness -->
    <path d="M 160 320 Q 250 345 340 320 L 336 345 Q 250 375 164 345 Z" fill="url(#chairSeatRim)" />
    <!-- Top Cushion Surface -->
    <path d="M 160 320 Q 250 345 340 320 Q 345 305 325 295 Q 250 310 175 295 Q 155 305 160 320 Z" fill="url(#chairCushionBlue)" />
    <!-- Center Cushion Bulge Highlight -->
    <ellipse cx="250" cy="324" rx="70" ry="14" fill="#60A5FA" opacity="0.45" />

    <!-- Ergonomic Backrest -->
    <!-- Backrest Shell -->
    <path d="M 190 280 C 180 200 185 110 205 65 C 220 35 280 35 295 65 C 315 110 320 200 310 280 C 290 295 210 295 190 280 Z" fill="url(#chairBackBlue)" stroke="#1D4ED8" stroke-width="2" />
    <!-- Contoured Inner Padding Rows -->
    <path d="M 205 130 Q 250 145 295 130" stroke="#60A5FA" stroke-width="3" stroke-linecap="round" opacity="0.7" />
    <path d="M 200 180 Q 250 198 300 180" stroke="#60A5FA" stroke-width="3" stroke-linecap="round" opacity="0.7" />
    <path d="M 195 235 Q 250 255 305 235" stroke="#60A5FA" stroke-width="3" stroke-linecap="round" opacity="0.7" />
    <!-- Glossy Spine Highlight -->
    <path d="M 215 70 Q 235 60 250 60 Q 265 60 285 70" stroke="#BAE6FD" stroke-width="5" stroke-linecap="round" opacity="0.8" />

    <!-- Left Armrest -->
    <g>
      <path d="M 185 270 Q 155 265 155 245 L 160 240 Q 165 260 190 264 Z" fill="url(#chairBaseDark)" />
      <!-- Armrest Pad -->
      <rect x="135" y="230" width="55" height="18" rx="9" fill="url(#chairBackBlue)" transform="rotate(-8 135 230)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))" />
      <rect x="137" y="232" width="51" height="6" rx="3" fill="#38BDF8" opacity="0.75" transform="rotate(-8 135 230)" />
    </g>

    <!-- Right Armrest -->
    <g>
      <path d="M 315 270 Q 345 265 345 245 L 340 240 Q 335 260 310 264 Z" fill="url(#chairBaseDark)" />
      <!-- Armrest Pad -->
      <rect x="310" y="222" width="55" height="18" rx="9" fill="url(#chairBackBlue)" transform="rotate(8 310 222)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))" />
      <rect x="312" y="224" width="51" height="6" rx="3" fill="#38BDF8" opacity="0.75" transform="rotate(8 310 222)" />
    </g>

    <!-- HANGING PURPLE "JOB OPPORTUNITY" SIGN -->
    <!-- Suspension Ring & Cord -->
    <circle cx="250" cy="100" r="14" fill="none" stroke="url(#chromeMetal)" stroke-width="5" />
    <circle cx="250" cy="100" r="8" fill="#1E293B" opacity="0.6" />
    <path d="M 242 108 L 195 180" stroke="url(#cordGrad)" stroke-width="5.5" stroke-linecap="round" />
    <path d="M 258 108 L 305 180" stroke="url(#cordGrad)" stroke-width="5.5" stroke-linecap="round" />

    <!-- Sign Grommet Eyelets -->
    <circle cx="195" cy="180" r="6" fill="#CBD5E1" stroke="#475569" stroke-width="2" />
    <circle cx="305" cy="180" r="6" fill="#CBD5E1" stroke="#475569" stroke-width="2" />

    <!-- 3D Signboard Body -->
    <g filter="url(#signShadow)">
      <!-- Back Shadow Rim -->
      <rect x="160" y="162" width="180" height="106" rx="24" fill="#3B0764" />
      <!-- Sign Surface -->
      <rect x="160" y="160" width="180" height="104" rx="24" fill="url(#purpleSignGrad)" stroke="#C084FC" stroke-width="2.5" />
      <!-- Top Specular Rim Reflection -->
      <path d="M 184 163 L 316 163" stroke="#F3E8FF" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />

      <!-- 3D Embossed White Typography -->
      <!-- Word 1: JOB -->
      <g filter="url(#textGlow)">
        <text x="250" y="210" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="38" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">JOB</text>
      </g>
      <!-- Word 2: OPPORTUNITY -->
      <g filter="url(#textGlow)">
        <text x="250" y="244" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">OPPORTUNITY</text>
      </g>
    </g>

  </g>
</svg>`;

// 2. VINTAGE PURPLE MICROPHONE WITH TICKET & CALENDAR
const micSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" fill="none">
  <defs>
    <!-- Soft Lavender Podium Floor -->
    <radialGradient id="micPodiumGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#A78BFA" stop-opacity="0.15" />
      <stop offset="85%" stop-color="#C4B5FD" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#EDE9FE" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="micDisk" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FAF5FF" />
      <stop offset="70%" stop-color="#F3E8FF" />
      <stop offset="100%" stop-color="#E9D5FF" />
    </radialGradient>

    <!-- Metallic Purple Gradients -->
    <linearGradient id="purpleMetalGrad" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="25%" stop-color="#9333EA" />
      <stop offset="70%" stop-color="#6B21A8" />
      <stop offset="100%" stop-color="#3B0764" />
    </linearGradient>
    <linearGradient id="micBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="50%" stop-color="#6D28D9" />
      <stop offset="100%" stop-color="#4C1D95" />
    </linearGradient>
    <linearGradient id="chromeBand" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E9D5FF" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#C4B5FD" />
    </linearGradient>

    <!-- Floating Ticket Gradient -->
    <linearGradient id="ticketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#6D28D9" />
    </linearGradient>

    <!-- Floating Mini Calendar Gradient -->
    <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9333EA" />
      <stop offset="100%" stop-color="#581C87" />
    </linearGradient>

    <!-- Burst Accent Gradients -->
    <linearGradient id="burstPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F472B6" />
      <stop offset="100%" stop-color="#C026D3" />
    </linearGradient>

    <filter id="micShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#6B21A8" flood-opacity="0.32" />
    </filter>
    <filter id="floatShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#4C1D95" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- 3D Soft Podium Floor Base -->
  <ellipse cx="250" cy="440" rx="190" ry="46" fill="url(#micPodiumGrad)" />
  <ellipse cx="250" cy="432" rx="150" ry="34" fill="url(#micDisk)" stroke="#E9D5FF" stroke-width="2" />

  <!-- 3 Pink/Purple Dynamic Accent Bursts (Top-Right) -->
  <g opacity="0.95">
    <path d="M 335 95 L 348 70" stroke="url(#burstPink)" stroke-width="7" stroke-linecap="round" />
    <path d="M 360 115 L 382 100" stroke="url(#burstPink)" stroke-width="7" stroke-linecap="round" />
    <path d="M 368 140 L 395 142" stroke="url(#burstPink)" stroke-width="7" stroke-linecap="round" />
  </g>

  <!-- FLOATING ADMISSION PASS / TICKET (LEFT) -->
  <g filter="url(#floatShadow)" transform="translate(60, 220) rotate(-16)">
    <!-- Ticket Body with Notched Sides -->
    <path d="M 10 0 L 110 0 A 10 10 0 0 1 110 30 L 110 70 A 10 10 0 0 1 110 100 L 10 100 A 10 10 0 0 1 10 70 L 10 30 A 10 10 0 0 1 10 0 Z" fill="url(#ticketGrad)" stroke="#E9D5FF" stroke-width="2" />
    <!-- Inner White Pass Area -->
    <rect x="26" y="16" width="68" height="68" rx="8" fill="#FAF5FF" />
    <rect x="36" y="32" width="48" height="8" rx="4" fill="#C084FC" />
    <rect x="36" y="48" width="34" height="6" rx="3" fill="#D8B4FE" />
    <rect x="36" y="60" width="24" height="6" rx="3" fill="#E9D5FF" />
  </g>

  <!-- FLOATING MINI CALENDAR (RIGHT) -->
  <g filter="url(#floatShadow)" transform="translate(325, 205) rotate(14)">
    <!-- Calendar Body -->
    <rect x="0" y="10" width="105" height="100" rx="16" fill="url(#calGrad)" stroke="#E9D5FF" stroke-width="2" />
    <!-- White Sheet Surface -->
    <rect x="8" y="24" width="89" height="78" rx="10" fill="#FFFFFF" />
    <!-- Top Rings -->
    <rect x="22" y="4" width="8" height="18" rx="4" fill="#E2E8F0" />
    <rect x="50" y="4" width="8" height="18" rx="4" fill="#E2E8F0" />
    <rect x="76" y="4" width="8" height="18" rx="4" fill="#E2E8F0" />
    <!-- Day Blocks Grid -->
    <rect x="18" y="34" width="20" height="18" rx="5" fill="#C084FC" />
    <rect x="44" y="34" width="20" height="18" rx="5" fill="#A855F7" />
    <rect x="70" y="34" width="20" height="18" rx="5" fill="#7C3AED" />
    <rect x="18" y="60" width="20" height="18" rx="5" fill="#A855F7" />
    <rect x="44" y="60" width="20" height="18" rx="5" fill="#7C3AED" />
    <rect x="70" y="60" width="20" height="18" rx="5" fill="#F472B6" />
  </g>

  <!-- MAIN VINTAGE 3D MICROPHONE -->
  <g filter="url(#micShadow)">
    
    <!-- Base Weighted Stand -->
    <ellipse cx="250" cy="425" rx="75" ry="24" fill="url(#micBaseGrad)" stroke="#C084FC" stroke-width="3" />
    <ellipse cx="250" cy="420" rx="58" ry="16" fill="#FAF5FF" opacity="0.4" />
    <ellipse cx="250" cy="418" rx="42" ry="11" fill="url(#purpleMetalGrad)" />

    <!-- Stand Shaft & Joint Neck -->
    <rect x="242" y="280" width="16" height="140" rx="6" fill="url(#purpleMetalGrad)" stroke="#A855F7" stroke-width="1.5" />
    <path d="M 246 280 L 246 420" stroke="#FAF5FF" stroke-width="3" stroke-linecap="round" opacity="0.75" />

    <!-- U-Shaped Cradle Mount -->
    <path d="M 195 240 C 195 305 305 305 305 240" fill="none" stroke="url(#purpleMetalGrad)" stroke-width="12" stroke-linecap="round" />
    <circle cx="195" cy="240" r="10" fill="#E9D5FF" stroke="#7C3AED" stroke-width="3" />
    <circle cx="305" cy="240" r="10" fill="#E9D5FF" stroke="#7C3AED" stroke-width="3" />

    <!-- Microphone Capsule Body (Pill Shape) -->
    <!-- Lower Body -->
    <path d="M 205 210 C 205 270 295 270 295 210 Z" fill="url(#purpleMetalGrad)" stroke="#C084FC" stroke-width="2" />
    
    <!-- Lower Grille Slots -->
    <circle cx="225" cy="225" r="3.5" fill="#3B0764" />
    <circle cx="240" cy="230" r="3.5" fill="#3B0764" />
    <circle cx="255" cy="230" r="3.5" fill="#3B0764" />
    <circle cx="270" cy="225" r="3.5" fill="#3B0764" />

    <!-- Center Metallic Collar Band -->
    <rect x="198" y="195" width="104" height="24" rx="6" fill="url(#chromeBand)" stroke="#A855F7" stroke-width="2" />
    <circle cx="250" cy="207" r="7" fill="#9333EA" stroke="#FFFFFF" stroke-width="2" />

    <!-- Upper Capsule Grille Dome -->
    <path d="M 205 195 C 205 100 295 100 295 195 Z" fill="url(#purpleMetalGrad)" stroke="#C084FC" stroke-width="2" />

    <!-- Fine Hexagonal / Perforated Grille Mesh Texture -->
    <g fill="#3B0764" opacity="0.8">
      <!-- Row 1 -->
      <circle cx="235" cy="120" r="3" /><circle cx="250" cy="116" r="3" /><circle cx="265" cy="120" r="3" />
      <!-- Row 2 -->
      <circle cx="225" cy="135" r="3.2" /><circle cx="240" cy="132" r="3.2" /><circle cx="255" cy="132" r="3.2" /><circle cx="270" cy="135" r="3.2" />
      <!-- Row 3 -->
      <circle cx="220" cy="150" r="3.5" /><circle cx="235" cy="148" r="3.5" /><circle cx="250" cy="148" r="3.5" /><circle cx="265" cy="148" r="3.5" /><circle cx="280" cy="150" r="3.5" />
      <!-- Row 4 -->
      <circle cx="218" cy="165" r="3.5" /><circle cx="232" cy="164" r="3.5" /><circle cx="246" cy="164" r="3.5" /><circle cx="260" cy="164" r="3.5" /><circle cx="274" cy="164" r="3.5" /><circle cx="288" cy="165" r="3.5" />
      <!-- Row 5 -->
      <circle cx="216" cy="180" r="3.5" /><circle cx="230" cy="180" r="3.5" /><circle cx="244" cy="180" r="3.5" /><circle cx="258" cy="180" r="3.5" /><circle cx="272" cy="180" r="3.5" /><circle cx="286" cy="180" r="3.5" />
    </g>

    <!-- Glossy Specular Light Reflection -->
    <path d="M 215 170 C 215 125 240 108 260 106" stroke="#FAF5FF" stroke-width="7" stroke-linecap="round" opacity="0.75" />
  </g>
</svg>`;

// 3. ROYAL BLUE EXECUTIVE BRIEFCASE WITH DOCUMENTS
const briefcaseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" fill="none">
  <defs>
    <!-- Soft Podium Floor -->
    <radialGradient id="briefcasePodiumGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.32" />
      <stop offset="50%" stop-color="#60A5FA" stop-opacity="0.14" />
      <stop offset="85%" stop-color="#93C5FD" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#DBEAFE" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="briefcaseDisk" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#EFF6FF" />
      <stop offset="70%" stop-color="#DBEAFE" />
      <stop offset="100%" stop-color="#BFDBFE" />
    </radialGradient>

    <!-- Royal Blue Leather Gradients -->
    <linearGradient id="briefcaseFrontGrad" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="25%" stop-color="#0284C7" />
      <stop offset="65%" stop-color="#0052FF" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="briefcaseFlapGrad" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1E40AF" />
    </linearGradient>
    <linearGradient id="briefcaseGusset" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>

    <!-- Chrome Latch Buckle -->
    <linearGradient id="silverBuckle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#E2E8F0" />
      <stop offset="75%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#64748B" />
    </linearGradient>

    <!-- Dynamic Swoosh Gradient -->
    <linearGradient id="blueSwoosh" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#0052FF" />
    </linearGradient>

    <filter id="briefcaseShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="15" flood-color="#0052FF" flood-opacity="0.25" />
    </filter>
    <filter id="documentShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#1E3A8A" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- 3D Soft Podium Floor Base -->
  <ellipse cx="250" cy="440" rx="190" ry="46" fill="url(#briefcasePodiumGrad)" />
  <ellipse cx="250" cy="432" rx="150" ry="34" fill="url(#briefcaseDisk)" stroke="#DBEAFE" stroke-width="2" />

  <!-- 3 Blue Dynamic Accent Swooshes (Top-Left) -->
  <g opacity="0.95">
    <path d="M 85 220 Q 75 235 70 250" stroke="url(#blueSwoosh)" stroke-width="7" stroke-linecap="round" />
    <path d="M 110 200 Q 112 218 110 235" stroke="url(#blueSwoosh)" stroke-width="7" stroke-linecap="round" />
    <path d="M 135 190 Q 140 206 142 222" stroke="url(#blueSwoosh)" stroke-width="7" stroke-linecap="round" />
  </g>

  <!-- MAIN 3D BRIEFCASE & PAPERS GROUP -->
  <g filter="url(#briefcaseShadow)">
    
    <!-- Rear Wall of Briefcase -->
    <rect x="135" y="195" width="250" height="195" rx="30" fill="url(#briefcaseGusset)" />

    <!-- Side Accordion Pockets -->
    <!-- Left Gusset -->
    <path d="M 135 220 C 120 250 120 330 135 375 L 148 370 C 135 330 135 250 148 225 Z" fill="#0284C7" stroke="#0369A1" stroke-width="1.5" />
    <!-- Right Gusset -->
    <path d="M 385 220 C 400 250 400 330 385 375 L 372 370 C 385 330 385 250 372 225 Z" fill="#0369A1" />

    <!-- CLEAN WHITE DOCUMENT SHEETS STICKING OUT (TOP OPEN) -->
    <g filter="url(#documentShadow)">
      <!-- Back Sheet (slightly angled) -->
      <rect x="180" y="85" width="160" height="185" rx="16" fill="#F1F5F9" transform="rotate(-3 180 85)" />
      <!-- Main Front Sheet -->
      <rect x="175" y="80" width="165" height="190" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
      
      <!-- Document Text Bars (Blue Accent Bars) -->
      <rect x="200" y="112" width="115" height="12" rx="6" fill="#60A5FA" />
      <rect x="200" y="136" width="115" height="10" rx="5" fill="#93C5FD" />
      <rect x="200" y="156" width="95" height="10" rx="5" fill="#BFDBFE" />
      <rect x="200" y="176" width="60" height="8" rx="4" fill="#DBEAFE" />
    </g>

    <!-- Main Front Briefcase Body -->
    <rect x="130" y="215" width="260" height="175" rx="32" fill="url(#briefcaseFrontGrad)" stroke="#38BDF8" stroke-width="2" />
    <!-- Edge Stitching Line Detail -->
    <rect x="138" y="223" width="244" height="159" rx="26" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6" />

    <!-- Top Flap with Contoured Curve -->
    <path d="M 130 220 C 130 220 200 280 260 280 C 320 280 390 220 390 220 L 390 215 C 390 200 375 195 360 195 L 160 195 C 145 195 130 200 130 215 Z" fill="url(#briefcaseFlapGrad)" filter="drop-shadow(0 6px 8px rgba(0,0,0,0.25))" />
    <!-- Flap Glossy Highlight -->
    <path d="M 148 215 C 180 250 225 268 260 268 C 295 268 340 250 372 215" fill="none" stroke="#BAE6FD" stroke-width="3" stroke-linecap="round" opacity="0.8" />

    <!-- Center Metallic Buckle Clasp -->
    <g transform="translate(230, 255)">
      <!-- Outer Silver Plate -->
      <rect x="0" y="0" width="40" height="42" rx="10" fill="url(#silverBuckle)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
      <rect x="4" y="4" width="32" height="34" rx="7" fill="#CBD5E1" />
      <!-- Center Royal Blue Button/Lock -->
      <rect x="10" y="10" width="20" height="22" rx="5" fill="#0052FF" stroke="#38BDF8" stroke-width="1" />
    </g>

    <!-- Base Feet Studs -->
    <ellipse cx="170" cy="392" rx="10" ry="4" fill="#0F172A" />
    <ellipse cx="350" cy="392" rx="10" ry="4" fill="#0F172A" />

  </g>
</svg>`;

// 4. PURPLE CALENDAR WITH PINK MEGAPHONE, STAR & CONFETTI
const calendarMegaphoneSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" fill="none">
  <defs>
    <!-- Soft Lavender Podium Floor -->
    <radialGradient id="calPodiumGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#A78BFA" stop-opacity="0.15" />
      <stop offset="85%" stop-color="#C4B5FD" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#EDE9FE" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="calDisk" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FAF5FF" />
      <stop offset="70%" stop-color="#F3E8FF" />
      <stop offset="100%" stop-color="#E9D5FF" />
    </radialGradient>

    <!-- Purple Calendar Stand Gradients -->
    <linearGradient id="calBodyGrad" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="35%" stop-color="#9333EA" />
      <stop offset="75%" stop-color="#6B21A8" />
      <stop offset="100%" stop-color="#4C1D95" />
    </linearGradient>
    <linearGradient id="spiralRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF5FF" />
      <stop offset="40%" stop-color="#E9D5FF" />
      <stop offset="75%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#581C87" />
    </linearGradient>

    <!-- Vibrant Pink Megaphone Gradients -->
    <linearGradient id="megaHornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F472B6" />
      <stop offset="40%" stop-color="#EC4899" />
      <stop offset="80%" stop-color="#DB2777" />
      <stop offset="100%" stop-color="#9D174D" />
    </linearGradient>
    <linearGradient id="megaRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FDF2F8" />
      <stop offset="40%" stop-color="#F472B6" />
      <stop offset="100%" stop-color="#BE185D" />
    </linearGradient>

    <!-- Yellow Star Thought Bubble -->
    <linearGradient id="yellowBubble" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="50%" stop-color="#FACC15" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>

    <filter id="megaShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#831843" flood-opacity="0.35" />
    </filter>
    <filter id="calShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="15" flood-color="#581C87" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- 3D Soft Podium Floor Base -->
  <ellipse cx="250" cy="440" rx="190" ry="46" fill="url(#calPodiumGrad)" />
  <ellipse cx="250" cy="432" rx="150" ry="34" fill="url(#calDisk)" stroke="#E9D5FF" stroke-width="2" />

  <!-- Colorful Confetti Bursts -->
  <!-- Top Right Burst Lines -->
  <path d="M 345 75 L 360 55" stroke="#9333EA" stroke-width="6.5" stroke-linecap="round" />
  <path d="M 372 90 L 398 80" stroke="#7C3AED" stroke-width="6.5" stroke-linecap="round" />
  <path d="M 380 115 L 406 118" stroke="#9333EA" stroke-width="6.5" stroke-linecap="round" />
  <!-- Left Confetti Particles -->
  <path d="M 100 235 L 85 245" stroke="#9333EA" stroke-width="5" stroke-linecap="round" />
  <path d="M 75 270 L 60 275" stroke="#7C3AED" stroke-width="5" stroke-linecap="round" />
  <circle cx="95" cy="210" r="4.5" fill="#F59E0B" />
  <circle cx="120" cy="180" r="4" fill="#EC4899" />
  <!-- Right Confetti Particles -->
  <circle cx="410" cy="205" r="4.5" fill="#F59E0B" />
  <circle cx="395" cy="230" r="4" fill="#EC4899" />

  <!-- 3D DESK CALENDAR (REAR / MID) -->
  <g filter="url(#calShadow)">
    
    <!-- Calendar Easel Stand / Backing (Perspective tilt) -->
    <path d="M 160 140 L 360 140 L 380 370 L 140 370 Z" fill="url(#calBodyGrad)" stroke="#C084FC" stroke-width="2" />
    
    <!-- White Sheet Surface -->
    <path d="M 165 170 L 355 170 L 372 360 L 148 360 Z" fill="#FFFFFF" />

    <!-- 4 Spiral Rings on Top -->
    <!-- Ring 1 -->
    <ellipse cx="190" cy="135" rx="8" ry="24" fill="url(#spiralRing)" />
    <!-- Ring 2 -->
    <ellipse cx="240" cy="135" rx="8" ry="24" fill="url(#spiralRing)" />
    <!-- Ring 3 -->
    <ellipse cx="290" cy="135" rx="8" ry="24" fill="url(#spiralRing)" />
    <!-- Ring 4 -->
    <ellipse cx="340" cy="135" rx="8" ry="24" fill="url(#spiralRing)" />

    <!-- Calendar Month Header Band -->
    <path d="M 167 175 L 353 175 L 356 205 L 164 205 Z" fill="#FAF5FF" />

    <!-- Day Grid Blocks (Rounded Squares) -->
    <!-- Row 1 -->
    <rect x="180" y="220" width="34" height="30" rx="8" fill="#EC4899" />
    <rect x="230" y="220" width="34" height="30" rx="8" fill="#8B5CF6" />
    <rect x="280" y="220" width="34" height="30" rx="8" fill="#A855F7" />
    <!-- Row 2 -->
    <rect x="175" y="265" width="34" height="30" rx="8" fill="#F43F5E" />
    <rect x="225" y="265" width="34" height="30" rx="8" fill="#8B5CF6" />
    <rect x="275" y="265" width="34" height="30" rx="8" fill="#7C3AED" />
  </g>

  <!-- YELLOW STAR THOUGHT BUBBLE (TOP RIGHT OF CALENDAR) -->
  <g transform="translate(365, 120)" filter="drop-shadow(0 6px 10px rgba(0,0,0,0.18))">
    <!-- Bubble Body -->
    <rect x="0" y="0" width="55" height="50" rx="14" fill="url(#yellowBubble)" stroke="#FEF9C3" stroke-width="2" />
    <polygon points="12,48 20,48 8,58" fill="#FACC15" />
    <!-- White 5-pointed Star inside -->
    <polygon points="27,10 31,21 42,21 33,28 36,39 27,32 18,39 21,28 12,21 23,21" fill="#FFFFFF" />
  </g>

  <!-- 3D VIBRANT PINK MEGAPHONE IN FOREGROUND -->
  <g filter="url(#megaShadow)" transform="translate(230, 230)">
    
    <!-- Megaphone Cone/Horn (angled toward right) -->
    <path d="M 30 110 L 125 55 C 138 90 138 150 125 185 L 30 130 Z" fill="url(#megaHornGrad)" stroke="#F472B6" stroke-width="2" />

    <!-- Oval Front Mouth Rim of Horn -->
    <ellipse cx="125" cy="120" rx="20" ry="65" fill="url(#megaRimGrad)" stroke="#FFFFFF" stroke-width="3" />
    <ellipse cx="123" cy="120" rx="10" ry="45" fill="#831843" />

    <!-- Rear Capsule / Handle Base -->
    <rect x="5" y="98" width="30" height="44" rx="14" fill="#A855F7" stroke="#C084FC" stroke-width="2" />
    
    <!-- Grip Handle -->
    <path d="M 45 130 L 60 190 C 62 196 68 200 76 198 C 84 196 88 188 85 182 L 70 125 Z" fill="#1E293B" />
    <!-- Handle Ring Highlight -->
    <rect x="55" y="160" width="22" height="6" rx="3" fill="#A855F7" />

    <!-- Horn Top Reflection Highlight -->
    <path d="M 38 114 L 115 68" stroke="#FCE7F3" stroke-width="4.5" stroke-linecap="round" opacity="0.8" />
  </g>
</svg>`;

async function main() {
  console.log('Writing SVGs to public/images/quick-actions...');
  
  const assets = [
    { svg: chairSvg, name: 'blue-chair' },
    { svg: micSvg, name: 'purple-mic' },
    { svg: briefcaseSvg, name: 'blue-briefcase' },
    { svg: calendarMegaphoneSvg, name: 'purple-calendar' }
  ];

  for (const { svg, name } of assets) {
    const svgPath = path.join('public/images/quick-actions', `${name}.svg`);
    const pngPath = path.join('public/images/quick-actions', `${name}.png`);
    
    fs.writeFileSync(svgPath, svg, 'utf8');
    
    // Generate high-resolution 512x512 transparent PNG
    const buffer = await sharp(Buffer.from(svg), { density: 300 })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
      
    fs.writeFileSync(pngPath, buffer);
    console.log(`Rendered: ${pngPath} (${buffer.length} bytes)`);
  }

  console.log('Successfully generated all 4 3D card assets!');
}

main().catch(console.error);
