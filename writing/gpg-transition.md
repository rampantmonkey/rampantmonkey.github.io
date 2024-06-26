:title GPG Transition Statement
:description Notice of GPG key migration.
:external not a link but I want to hide this until I have time to edit it correctly
:date 2015-06-14
:slug gpg-transition

(Inspired by [http://viccuad.me/blog/GPG-transition-statement/](http://viccuad.me/blog/GPG-transition-statement/) and [https://www.dennogumi.org/2015/06/gpg-transition-statement/](https://www.dennogumi.org/2015/06/gpg-transition-statement/))

The exact same text can be found at [this location](http://rampantmonkey.com/gpg/gpg-transition-statement-2015-06.txt).

```
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256

Sun 14 Jun 2015

For a number of reasons, I've recently set up a new OpenPGP key, and will be transitioning away from my old one.

The old key will continue to be valid for some time, but I prefer all future correspondence to come to the new one. I would also like this new key to be re-integrated into the web of trust. This message is signed by both keys to certify the transition.

The old key was:

pub   rsa4096/41DE81A9 2013-07-03
      Key fingerprint = 42E4 3543 BBC6 AC9B D99D  6E10 92A7 599A 41DE 81A9

And the new key is:

pub   rsa4096/D119CD2B 2015-06-14 [expires: 2016-06-13]
      Key fingerprint = 35BC BE03 CA63 87B5 2349  5EE0 BAD7 5204 D119 CD2B

To fetch the full key you can get it with:

  wget -q -O- http://rampantmonkey.com/gpg/caseyrobinson.public.gpg-key | gpg --import -

Or, to fetch my new key from a public key servery, you can simply do:

  gpg --keyserver pgp.mit.edu --recv-key D119CD2B

If you already know my old key,  you can now verify that the new key is signed by the old one:

  gpg --check-sigs D119CD2B

If you don't already know my old key, or you just want to be double extra paranoid, you can check the fingerprint against the one above:

  gpg --fingerprint D119CD2B

If you are satisfied that you've got the right key, and the UIDs match what you expect, I'd appreciate it if you would sign my key:

  gpg --sign-key D119CD2B

Lastly, if you could upload these signatures, I would appreciate it. You can either send me an email with the new signatures (if you have a functional MTA on your system):

  gpg --armor --export D119CD2B | mail -s 'OpenPGP Signatures' casey at rampantmonkey.com

Or you can just upload the signatures to a public keyserver directly:

  gpg --keyserver pgp.mit.edu --send-key D119CD2B

Please let me know if there is any trouble, and sorry for the inconvenience.

Regards,
  Casey Robinson


-----BEGIN PGP SIGNATURE-----
Version: GnuPG v2

iQEcBAEBCAAGBQJVfjzCAAoJEPpdmdoZJ3eMogYH/3RskhZ9JXEqDl+ncU6Igbfp
+12XIWLfrVQMfi57E/YTKfIiZjEFscZK0+/EXysmOCcmLaEhXuuEwlvQ4spYvgLN
d6/dNLgkm4+/Jnfs8sBCd4/vsZfREgGlJpk4kzOOlJZ3Vc80pb4Jv59lM4Tgo//4
XH2n3gT19/U/dKssAGMjxVDe9VnkynmmT0xtq12drwifwQEn34yTqK0RCxMaPI9b
JYPRXw2pLlOedgqnaf2rcCHdv8tDZcVEcnO2wxjW6/EbbLadfMgJg8+ThpurJt9/
J9kQ7DX0k1DVOgJ9ktuIdyJRku+2kpEVS34zNld5Q1Wg5A4LeRh7/yTGGfLf8Qs=
=yeEH
-----END PGP SIGNATURE-----
```
