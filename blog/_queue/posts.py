# posts.py - all 7 NAR blog posts
# Run after gen.py is loaded: exec(open('posts.py').read())
import json, sys, os
sys.path.insert(0, 'C:/nappliancerepair/blog/_queue')
exec(open('C:/nappliancerepair/blog/_queue/gen.py', encoding='utf-8').read())

# ── POST 1: Samsung Fridge Problems Toronto ──────────────────────────────────
s1='samsung-fridge-problems-toronto'
t1='Samsung Fridge Problems Toronto: Top Issues and How to Fix Them'
d1="Samsung fridge not cooling, making noise, or leaking in Toronto? Learn the most common Samsung refrigerator problems and when to call a repair technician."
tag1='Samsung Repair'; dt1='February 25, 2026'; r1=7
ar1=json.dumps({"@context":"https://schema.org","@type":"Article","headline":t1,"datePublished":"2026-02-25","dateModified":"2026-02-25","author":{"@type":"Organization","name":"N Appliance Repair"},"publisher":{"@type":"Organization","name":"N Appliance Repair","url":"https://nappliancerepair.com"},"description":d1},separators=(',',':'))
fa1=json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the most common Samsung refrigerator problem?","acceptedAnswer":{"@type":"Answer","text":"The most common issue is the ice maker failing or freezing over, often caused by a defrost sensor fault. This affects Samsung French door and side-by-side models."}},{"@type":"Question","name":"Why is my Samsung fridge not cooling?","acceptedAnswer":{"@type":"Answer","text":"A failed evaporator fan, clogged condenser coils, or a faulty temperature sensor are the top causes. Ice buildup on evaporator coils from defrost system failure is also very common."}},{"@type":"Question","name":"How much does Samsung fridge repair cost in Toronto?","acceptedAnswer":{"@type":"Answer","text":"Most Samsung fridge repairs in Toronto cost between $180 and $380. Call N Appliance Repair at (437) 524-1053 for an exact quote."}},{"@type":"Question","name":"Is it worth repairing a Samsung refrigerator?","acceptedAnswer":{"@type":"Answer","text":"Yes, if the fridge is under 10 years old and the repair cost is less than 50% of replacement value. Samsung parts are widely available."}}]},separators=(',',':'))
b1=(
"<p>Samsung refrigerators are among the most popular in Toronto homes \u2014 and also among the most frequently repaired. "
"Our technicians at N Appliance Repair have serviced hundreds of Samsung fridges across the GTA since 2017, "
"and certain problems appear time and again. This guide covers the top issues, what causes them, and what to do about it.</p>"
"<h2>1. Ice Maker Not Working or Freezing Over</h2>"
"<p>This is the single most common call we get for Samsung refrigerators in Toronto. Samsung French door and side-by-side models "
"have a known design issue where the ice maker compartment ices over, blocking production. "
"The root cause is usually a failed defrost heater or temperature sensor in the ice maker housing.</p>"
"<div class=\"tip-box\"><p><strong>Quick check:</strong> Open the ice maker cover and look for a solid block of ice. "
"If you see it, the defrost system has failed. A manual defrost restores function temporarily, but the faulty part must be replaced.</p></div>"
"<h2>2. Samsung Fridge Not Cooling Properly</h2>"
"<p>If your Samsung fridge is warm but the freezer is fine, the evaporator fan motor is usually the culprit. "
"The fan circulates cold air from the freezer into the fridge section. When it fails, the freezer stays cold "
"but the refrigerator warms up to unsafe temperatures.</p>"
"<ul><li><strong>Clogged condenser coils</strong> \u2014 dust buildup reduces cooling efficiency</li>"
"<li><strong>Faulty thermistor</strong> \u2014 incorrect temperature readings cause the compressor to cycle incorrectly</li>"
"<li><strong>Defrost system failure</strong> \u2014 ice buildup on evaporator coils blocks airflow</li></ul>"
"<h2>3. Water Leaking Inside or Under the Fridge</h2>"
"<p>Leaks inside the fridge are almost always caused by a clogged defrost drain. As ice melts during the defrost cycle, "
"water drains through a tube to the drain pan under the fridge. When this tube clogs with ice or debris, "
"water pools inside the fridge and eventually leaks onto your floor.</p>"
"<div class=\"warning-box\"><p><strong>Important:</strong> Never ignore a water leak. In Toronto homes with hardwood or "
"laminate floors, even a slow drip can cause significant floor damage within days.</p></div>"
"<h2>4. Samsung Fridge Making Loud Noises</h2>"
"<div class=\"step-block\"><div class=\"step-num\">1</div><div class=\"step-body\">"
"<h3>Loud clicking or buzzing</h3><p>Usually the start relay on the compressor. When it fails, you hear clicking and the fridge may not cool.</p></div></div>"
"<div class=\"step-block\"><div class=\"step-num\">2</div><div class=\"step-body\">"
"<h3>Rattling or vibrating</h3><p>Often the condenser fan hitting accumulated frost or debris. Check that the fridge is level.</p></div></div>"
"<div class=\"step-block\"><div class=\"step-num\">3</div><div class=\"step-body\">"
"<h3>Grinding or squealing</h3><p>The evaporator fan motor bearings are worn. This sound gets louder when you open the freezer door.</p></div></div>"
"<h2>5. Samsung Error Codes on Display</h2>"
"<p>Common Samsung fridge error codes: <strong>88 88</strong> (power fluctuation \u2014 unplug 60 sec), "
"<strong>PC ER</strong> (communication error between boards), <strong>1E/2E/SE</strong> (sensor failures), "
"<strong>OF OF</strong> (demo mode \u2014 fridge not cooling). Hold Energy Saver + Freezer buttons 3 sec to exit demo mode.</p>"
"<h2>6. Door Gasket and Seal Problems</h2>"
"<p>A worn door gasket allows warm, humid Toronto air to enter the fridge. You will notice condensation inside, "
"frost buildup, or the fridge running constantly. Gaskets typically cost $60\u2013$120 and can be replaced without special tools.</p>"
"<h2>When to Call a Samsung Fridge Repair Tech in Toronto</h2>"
"<p>DIY fixes work for cleaning coils, clearing drain tubes, or exiting demo mode. For compressor issues, refrigerant leaks, "
"control board failures, or anything involving electrical components, call a certified technician. "
"N Appliance Repair has been servicing Samsung refrigerators in Toronto since 2017. "
"We carry Samsung parts in our vans and can typically complete repairs on the first visit.</p>"
"<div class=\"cta-box\"><h3>Samsung Fridge Problem in Toronto?</h3>"
"<p>Same-day service available. We carry Samsung parts. 90-day warranty on all repairs.</p>"
"<a href=\"tel:+14375241053\">" + SVG + " (437) 524-1053 \u2014 Call Now</a></div>"
"<div class=\"faq-section\"><h2>Frequently Asked Questions</h2>"
) + fqh([
    ("What is the most common Samsung refrigerator problem?","The most common issue is the ice maker failing or freezing over, often caused by a defrost sensor fault."),
    ("Why is my Samsung fridge not cooling?","A failed evaporator fan, clogged condenser coils, or a faulty temperature sensor are the top causes."),
    ("How much does Samsung fridge repair cost in Toronto?","Most repairs cost $180\u2013$380. Call N Appliance Repair at (437) 524-1053 for a quote."),
    ("Is it worth repairing a Samsung refrigerator?","Yes, if under 10 years old and repair cost is less than 50% of replacement value."),
]) + "</div>"
wp(s1,t1,d1,tag1,dt1,r1,ar1,fa1,b1)

# -- POST 2: Whirlpool Washer Problems Toronto
s2='whirlpool-washer-problems-toronto'
t2='Whirlpool Washer Problems Toronto: Common Faults and Fixes'
d2='Whirlpool washer not spinning, draining, or starting in Toronto? Our repair techs explain the most common Whirlpool washing machine problems and how to fix them.'
tag2='Washer Repair'
dt2='February 26, 2026'
r2=8
ar2='{"@context":"https://schema.org","@type":"Article","headline":"Whirlpool Washer Problems Toronto: Common Faults and Fixes","datePublished":"2026-02-26","dateModified":"2026-02-26","author":{"@type":"Organization","name":"N Appliance Repair"},"publisher":{"@type":"Organization","name":"N Appliance Repair","url":"https://nappliancerepair.com"},"description":"Whirlpool washer not spinning, draining, or starting in Toronto? Our repair techs explain the most common Whirlpool washing machine problems and how to fix them."}'
fa2='{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Why is my Whirlpool washer not spinning?","acceptedAnswer":{"@type":"Answer","text":"The most common causes are a worn drive belt, a faulty lid switch (top-loaders), or a bad door latch sensor (front-loaders)."}},{"@type":"Question","name":"Why is my Whirlpool washer not draining?","acceptedAnswer":{"@type":"Answer","text":"A clogged drain pump filter, a kinked drain hose, or a failed pump motor are the top causes. Clean the filter first."}},{"@type":"Question","name":"How much does Whirlpool washer repair cost in Toronto?","acceptedAnswer":{"@type":"Answer","text":"Whirlpool washer repairs in Toronto typically cost 150 to 320 dollars. Call N Appliance Repair at (437) 524-1053."}},{"@type":"Question","name":"What does the F5 E2 error mean on a Whirlpool washer?","acceptedAnswer":{"@type":"Answer","text":"F5 E2 means the door is not locking properly. If the latch is clear, the door latch assembly needs replacement."}}]}'
b2_body='<p>Whirlpool is one of the most reliable washer brands on the market, but even the best machines develop problems over time. At N Appliance Repair, we service Whirlpool washers across Toronto every day. These are the faults we see most often and what you can do about them.</p><h2>1. Whirlpool Washer Not Spinning</h2><p>A washer that fills and agitates but will not spin is one of the most common Whirlpool complaints. The spin cycle requires several components to work in sequence.</p><div class="step-block"><div class="step-num">1</div><div class="step-body"><h3>Top-loader: Lid switch or actuator</h3><p>The washer will not spin if the lid switch does not confirm the lid is closed. On newer models, a door actuator performs this function.</p></div></div><div class="step-block"><div class="step-num">2</div><div class="step-body"><h3>Front-loader: Door latch assembly</h3><p>The door must lock before the spin cycle starts. A faulty latch sensor triggers F5 E2 or similar error codes.</p></div></div><div class="step-block"><div class="step-num">3</div><div class="step-body"><h3>Drive belt or motor coupling</h3><p>On older top-load Whirlpool washers, a worn drive belt or broken motor coupling is the most common spin failure. You may hear the motor running but the drum will not turn.</p></div></div><h2>2. Whirlpool Washer Not Draining</h2><p>Standing water in the drum after the cycle is a sign of a drain problem. Before calling a technician, check these easy fixes:</p><ul><li><strong>Clean the pump filter</strong> â\x80\x94 on front-loaders, there is a small access panel at the bottom front. Unscrew the filter cap and clean out lint, coins, and debris.</li><li><strong>Check the drain hose</strong> â\x80\x94 make sure it is not kinked or blocked where it connects to the wall standpipe.</li><li><strong>Verify standpipe height</strong> â\x80\x94 the drain hose should enter the standpipe no deeper than 8 inches, and the standpipe should be 30â\x80\x9396 inches high.</li></ul><p>If cleaning the filter does not help, the drain pump motor itself may have failed. This is a common repair we complete same-day.</p><h2>3. Whirlpool Washer Leaking Water</h2><ul><li><strong>Front leaks on front-loaders</strong> â\x80\x94 usually the door boot seal. Tears or cracks in the rubber gasket allow water to escape during the wash cycle.</li><li><strong>Leaks from the back</strong> â\x80\x94 check hose connections at the water inlet valve. Hoses degrade over 5â\x80\x938 years and should be replaced proactively.</li><li><strong>Leaks from the bottom</strong> â\x80\x94 often the pump seal or drain hose connection inside the machine.</li></ul><div class="warning-box"><p><strong>Toronto tip:</strong> During winter months, washer hoses in uninsulated laundry rooms can freeze and crack. If your washer starts leaking after a cold snap, check the inlet hoses first.</p></div><h2>4. Whirlpool Washer Error Codes</h2><ul><li><strong>F0 E1 / F0 E2</strong> â\x80\x94 control board communication error. Try unplugging the washer for 60 seconds.</li><li><strong>F5 E2</strong> â\x80\x94 door latch not engaging. Check for clothing caught in the door.</li><li><strong>F7 E1</strong> â\x80\x94 basket speed sensor fault. Usually requires motor or control board replacement.</li><li><strong>F8 E1 / LO FL</strong> â\x80\x94 low water flow. Check supply valves are fully open.</li><li><strong>Sd / SuDS</strong> â\x80\x94 too many suds. Use only HE detergent in front-load Whirlpool washers.</li></ul><h2>5. Whirlpool Washer Making Loud Noise</h2><p>Banging during the spin cycle is usually an unbalanced load â\x80\x94 redistribute the clothing and try again. Persistent banging or grinding points to worn drum bearings, a failing shock absorber (front-loaders), or a cracked drum spider. Drum bearing replacement costs $200â\x80\x93$350 in parts and labour.</p><h2>6. Whirlpool Washer Not Starting</h2><ul><li>Check that the power cord is firmly plugged in</li><li>Confirm the circuit breaker has not tripped â\x80\x94 washer circuits are typically 20A</li><li>Make sure the lid or door is fully closed and latched</li><li>Check that child lock is not activated</li><li>Try a hard reset: unplug for 60 seconds, then plug back in</li></ul><h2>Whirlpool Washer Repair in Toronto</h2><p>N Appliance Repair has been fixing Whirlpool washers in Toronto homes since 2017. We stock common Whirlpool parts and most repairs are completed on the first visit. All repairs include a 90-day warranty on parts and labour.</p>'
b2_cta='<div class="cta-box"><h3>Whirlpool Washer Problem in Toronto?</h3><p>Same-day service available. 90-day warranty on all repairs.</p><a href="tel:+14375241053">SVGPH (437) 524-1053 â\x80\x94 Call Now</a></div>'.replace("SVGPH",SVG)
b2_faq='<div class="faq-section"><h2>Frequently Asked Questions</h2>'+fqh([('Why is my Whirlpool washer not spinning?', 'The most common causes are a worn drive belt, a faulty lid switch (top-loaders), or a bad door latch sensor (front-loaders).'), ('Why is my Whirlpool washer not draining?', 'A clogged drain pump filter, a kinked drain hose, or a failed pump motor are the top causes.'), ('How much does Whirlpool washer repair cost in Toronto?', 'Whirlpool washer repairs in Toronto typically cost $150 to $320. Call N Appliance Repair at (437) 524-1053.'), ('What does the F5 E2 error mean on a Whirlpool washer?', 'F5 E2 means the door is not locking properly. If the latch is clear, the door latch assembly needs replacement.')])+"</div>"
b2=b2_body+b2_cta+b2_faq
wp(s2,t2,d2,tag2,dt2,r2,ar2,fa2,b2)
