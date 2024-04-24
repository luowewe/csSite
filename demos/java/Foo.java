import java.nio.charset.StandardCharsets;

public class Foo {

  public static void main(String[] argv) throws Exception {
    var text = new String(System.in.readAllBytes(), StandardCharsets.UTF_8);
    System.out.println("hello, world! " + System.currentTimeMillis());
    System.out.println(text.length() + " characters in input.");
    System.out.println(fib(10));
  }

  public static long fib(long n) {
    return n < 2 ? n : fib(n - 2) + fib(n - 1);
  }
}
