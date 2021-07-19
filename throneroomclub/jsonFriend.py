 # python jsonFriend.py /Users/marieflanagan/Downloads/2020-07-24T19_40_47Z_throne-room-club_data.json   

import sys
f = open(sys.argv[1])
for i in range(1000):
    r = f.read(10*1000*1000)
    if len(r) == 0:
        print "done!"
        break
    if "writing" in r:
        print "found something!"
    else:
        print "found nothing"
        # f.read(100000)
